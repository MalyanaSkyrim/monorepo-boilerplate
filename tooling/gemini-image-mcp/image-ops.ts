// cspell:ignore rasterisation rasterise colour letterboxing unblend lanczos neighbour
// Local image post-processing for the Gemini image MCP: background removal,
// no-crop resizing, square padding for icons, and SVG rasterisation.
import path from 'node:path'
import sharp from 'sharp'

// Aspect ratios accepted by Gemini image models (imageConfig.aspectRatio).
export const ASPECT_RATIOS = [
  '1:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '4:5',
  '5:4',
  '9:16',
  '16:9',
  '21:9',
] as const
export type AspectRatio = (typeof ASPECT_RATIOS)[number]

export type Rgba = Required<sharp.RGBA>
export const TRANSPARENT: Rgba = { r: 0, g: 0, b: 0, alpha: 0 }

const PNG_OPTIONS: sharp.PngOptions = {
  compressionLevel: 9,
  adaptiveFiltering: true,
}

// Colour distance (0–441) at or below which a pixel is pure background, and
// above which it is fully foreground. Pixels in between become partially
// transparent so edges stay anti-aliased.
const BG_INNER = 28
const BG_OUTER = 90

// Pick the supported ratio closest to width:height. Compared in log space so
// 2:1 and 1:2 are equally far from 1:1.
export function closestAspectRatio(width: number, height: number): AspectRatio {
  const target = Math.log(width / height)
  let best: AspectRatio = '1:1'
  let bestDiff = Infinity
  for (const ratio of ASPECT_RATIOS) {
    const [w = 1, h = 1] = ratio.split(':').map(Number)
    const diff = Math.abs(Math.log(w / h) - target)
    if (diff < bestDiff) {
      best = ratio
      bestDiff = diff
    }
  }
  return best
}

// Re-encode any input as PNG. SVGs rasterise at 72 DPI by default, so the
// density is raised until the longest side reaches `minSize`.
export async function toPng(input: Buffer, minSize = 1024): Promise<Buffer> {
  const meta = await sharp(input).metadata()
  if (meta.format !== 'svg') return sharp(input).png(PNG_OPTIONS).toBuffer()
  const longest = Math.max(meta.width, meta.height)
  const density = Math.min(72 * Math.max(1, minSize / longest), 10_000)
  return sharp(input, { density }).png(PNG_OPTIONS).toBuffer()
}

export async function dimensions(input: Buffer) {
  const { width, height } = await sharp(input).metadata()
  return { width, height }
}

async function rawRgba(input: Buffer) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

const median = (values: number[]) =>
  values.sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? 0

// Median colour of the outer 2px ring, used as the padding colour so
// letterboxing blends into the image (transparent if the border is).
export async function detectBorderColor(input: Buffer): Promise<Rgba> {
  const { data, width, height } = await rawRgba(input)
  const ring = 2
  const channels: [number[], number[], number[], number[]] = [[], [], [], []]
  for (let y = 0; y < height; y++) {
    const edgeRow = y < ring || y >= height - ring
    for (let x = 0; x < width; x++) {
      if (!edgeRow && x === ring) x = Math.max(ring, width - ring)
      const i = (y * width + x) * 4
      channels.forEach((values, c) => values.push(data[i + c] ?? 0))
    }
  }
  const [r, g, b, a] = channels.map(median)
  return { r: r ?? 0, g: g ?? 0, b: b ?? 0, alpha: (a ?? 255) / 255 }
}

const clampByte = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

// An edge pixel is alpha*fg + (1-alpha)*bg. Recover fg so the edge doesn't
// keep a halo of the old background colour.
function unblend(data: Buffer, i: number, bg: Rgba, alpha: number) {
  const bgChannels = [bg.r, bg.g, bg.b]
  for (let c = 0; c < 3; c++) {
    const value = data[i + c] ?? 0
    data[i + c] = clampByte(
      (value - (1 - alpha) * (bgChannels[c] ?? 0)) / alpha,
    )
  }
  data[i + 3] = clampByte((data[i + 3] ?? 255) * alpha)
}

// Make the solid background transparent. Flood-fills from the image edges,
// so only background connected to the border is removed and same-coloured
// shapes inside the subject (e.g. white details in a logo) are preserved.
export async function removeBackground(input: Buffer): Promise<Buffer> {
  const bg = await detectBorderColor(input)
  const { data, width, height } = await rawRgba(input)
  const count = width * height

  const dist = new Float32Array(count)
  for (let p = 0; p < count; p++) {
    const i = p * 4
    dist[p] = Math.hypot(
      (data[i] ?? 0) - bg.r,
      (data[i + 1] ?? 0) - bg.g,
      (data[i + 2] ?? 0) - bg.b,
    )
  }

  const visited = new Uint8Array(count)
  const queue = new Int32Array(count)
  let head = 0
  let tail = 0
  const visit = (p: number) => {
    if (visited[p]) return
    visited[p] = 1
    const d = dist[p] ?? Infinity
    if (d <= BG_INNER) queue[tail++] = p
    else if (d < BG_OUTER)
      unblend(data, p * 4, bg, (d - BG_INNER) / (BG_OUTER - BG_INNER))
  }

  for (let x = 0; x < width; x++) {
    visit(x)
    visit((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    visit(y * width)
    visit(y * width + width - 1)
  }

  while (head < tail) {
    const p = queue[head++] ?? 0
    data[p * 4 + 3] = 0
    const x = p % width
    if (x > 0) visit(p - 1)
    if (x < width - 1) visit(p + 1)
    if (p >= width) visit(p - width)
    if (p < count - width) visit(p + width)
  }

  return sharp(data, { raw: { width, height, channels: 4 } })
    .png(PNG_OPTIONS)
    .toBuffer()
}

// Trim uniform (or transparent) margins, based on the top-left pixel.
export async function trim(input: Buffer): Promise<Buffer> {
  try {
    return await sharp(input)
      .trim({ threshold: 12 })
      .png(PNG_OPTIONS)
      .toBuffer()
  } catch {
    // sharp throws when the whole image is a single colour; nothing to trim.
    return input
  }
}

// Scale to fit inside width×height and letterbox the remainder with
// `background`. Never crops. With a single dimension it scales proportionally.
export async function fitNoCrop(
  input: Buffer,
  {
    width,
    height,
    background,
  }: { width?: number; height?: number; background: sharp.Color },
): Promise<Buffer> {
  return sharp(input)
    .resize({ width, height, fit: 'contain', background, kernel: 'lanczos3' })
    .png(PNG_OPTIONS)
    .toBuffer()
}

// Trim, then centre the content on a square canvas with `paddingPercent`
// margin on each side (icon safe zone).
export async function padSquare(
  input: Buffer,
  paddingPercent: number,
  background: Rgba,
): Promise<Buffer> {
  const content = await trim(input)
  const { width, height } = await dimensions(content)
  const side = Math.ceil(
    Math.max(width, height) / (1 - (2 * paddingPercent) / 100),
  )
  const left = Math.floor((side - width) / 2)
  const top = Math.floor((side - height) / 2)
  const image = sharp(content)
  // Opaque output drops the alpha channel (iOS app icons reject it).
  return (
    background.alpha < 1 ? image.ensureAlpha() : image.flatten({ background })
  )
    .extend({
      top,
      left,
      bottom: side - height - top,
      right: side - width - left,
      background,
    })
    .png(PNG_OPTIONS)
    .toBuffer()
}

// Square RGBA icon at `size`. Tiny sizes get a light sharpen to counter
// downscaling blur.
export async function iconPng(input: Buffer, size: number): Promise<Buffer> {
  const resized = sharp(input).ensureAlpha().resize(size, size, {
    fit: 'contain',
    background: TRANSPARENT,
    kernel: 'lanczos3',
  })
  return (size <= 48 ? resized.sharpen({ sigma: 0.5 }) : resized)
    .png(PNG_OPTIONS)
    .toBuffer()
}

// Nearest-neighbour upscale: shows exactly which pixels a tiny icon has.
export async function magnify(input: Buffer, size: number): Promise<Buffer> {
  return sharp(input)
    .resize(size, size, { kernel: 'nearest' })
    .png(PNG_OPTIONS)
    .toBuffer()
}

// Pack PNGs into a .ico container. PNG-compressed entries are supported by
// every modern browser and Windows Vista+.
export function encodeIco(images: { size: number; png: Buffer }[]): Buffer {
  const header = Buffer.alloc(6 + 16 * images.length)
  header.writeUInt16LE(1, 2) // type: icon
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i
    header.writeUInt8(size >= 256 ? 0 : size, entry) // 0 means 256
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1)
    header.writeUInt16LE(1, entry + 4) // colour planes
    header.writeUInt16LE(32, entry + 6) // bits per pixel
    header.writeUInt32LE(png.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += png.length
  })
  return Buffer.concat([header, ...images.map(({ png }) => png)])
}

// Parse #rgb, #rrggbb or #rrggbbaa.
export function hexToRgba(hex: string): Rgba {
  const digits = hex.replace('#', '')
  const full = (
    digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits
  ).padEnd(8, 'f')
  const byte = (i: number) => parseInt(full.slice(i * 2, i * 2 + 2), 16)
  return { r: byte(0), g: byte(1), b: byte(2), alpha: byte(3) / 255 }
}

// Resolve `p` against the cwd and reject anything outside `roots`.
export function resolveInside(p: string, roots: string[]): string {
  const abs = path.resolve(p)
  const inside = roots.some((root) => {
    const rel = path.relative(root, abs)
    return !rel.startsWith('..') && !path.isAbsolute(rel)
  })
  if (!inside) throw new Error(`Path must be inside the repository: ${p}`)
  return abs
}
