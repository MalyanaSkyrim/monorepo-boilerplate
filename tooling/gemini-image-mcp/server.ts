#!/usr/bin/env node
// Gemini image-generation MCP server for Claude Code: raster images, logos /
// app icons, favicon sets, SVGs, and no-crop resizing.
// Run directly with Node (native TS type stripping); see .mcp.json at the repo root.
// cspell:words colour colours recognisable rasterise rasterising letterboxed
import { GoogleGenAI, type Part } from '@google/genai'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'

import {
  ASPECT_RATIOS,
  type AspectRatio,
  closestAspectRatio,
  detectBorderColor,
  dimensions,
  encodeIco,
  fitNoCrop,
  hexToRgba,
  iconPng,
  magnify,
  padSquare,
  removeBackground,
  resolveInside,
  type Rgba,
  toPng,
  TRANSPARENT,
  trim,
} from './image-ops.ts'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set')
  process.exit(1)
}

// Check Google's model list for current names. Gemini 3 image models support
// 2K/4K output; 2.5 only produces ~1K and rejects imageSize.
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3-pro-image'
const SVG_MODEL = process.env.GEMINI_SVG_MODEL ?? 'gemini-3.1-pro-preview'
const SUPPORTS_IMAGE_SIZE = !IMAGE_MODEL.startsWith('gemini-2.5')
const REPO_ROOT = process.cwd()
const OUT_DIR = path.resolve(process.env.IMAGE_OUT_DIR ?? 'generated-images')
const READABLE_ROOTS = [REPO_ROOT, OUT_DIR]

const IMAGE_SIZES = ['1K', '2K', '4K'] as const
type ImageSize = (typeof IMAGE_SIZES)[number]

const LOGO_MASTER_SIZE = 1024

const FAVICON_ICO_SIZES = [16, 32, 48]
const FAVICON_MANIFEST_SIZES = [192, 512]
const APPLE_ICON_SIZE = 180
// Margin per side: tab icons need every pixel; iOS rounds the apple icon's
// corners, so its mark needs more room.
const FAVICON_PADDING = 4
const APPLE_ICON_PADDING = 12
const WHITE: Rgba = { r: 255, g: 255, b: 255, alpha: 1 }

const ai = new GoogleGenAI({ apiKey })
const server = new McpServer({ name: 'gemini-image', version: '2.0.0' })

// Restrict filenames to prevent path traversal (no slashes or dots).
const filenameSchema = z
  .string()
  .regex(/^[\w-]{1,64}$/)
  .optional()
  .describe('Output base name without extension. Defaults to a timestamp.')
const referenceImagesSchema = z
  .array(z.string())
  .max(6)
  .optional()
  .describe(
    'Repo-relative image paths (png, jpg, webp or svg) sent to Gemini as brand/style references, or as the image to edit.',
  )
const dimensionSchema = z.number().int().min(16).max(8192)
const hexColorSchema = z
  .string()
  .regex(/^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i)

const REFERENCE_MIME = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
])

const TRANSPARENT_HINT =
  'Place the subject on a plain, perfectly uniform, solid pure white (#FFFFFF) background with no shadow, gradient, texture or vignette.'

const LOGO_GUIDE = [
  'Design a professional app logo / icon mark.',
  'Style: flat vector look, bold simple geometric shapes, crisp clean edges, a limited palette of 2-4 colours, high contrast.',
  'Composition: a single centred mark with a strong silhouette that stays recognisable at 32px, with generous empty margin around it.',
  'Avoid: mockups, devices, photos, 3D renders, drop shadows, textures, noise, borders or frames, and any text or letters unless the brief asks for them.',
].join('\n')

const FAVICON_GUIDE = [
  'Design a favicon: a tiny browser-tab icon that must stay clear and recognisable at 16×16 pixels.',
  'Use one bold, simple symbol or a single letter with thick strokes, at most 2-3 flat colours and strong contrast.',
  'No fine detail, thin lines, small text, gradients, shadows, textures or 3D.',
  'Centre the mark and let it fill about 85% of the canvas.',
].join('\n')

const SVG_SYSTEM = [
  'You are an expert vector illustrator and icon designer who writes hand-crafted SVG.',
  'Reply with exactly one self-contained <svg> element and nothing else: no prose, no markdown fences.',
  'Rules:',
  '- Include xmlns="http://www.w3.org/2000/svg" and the requested viewBox; omit width/height attributes.',
  '- Use only shapes, paths, groups, gradients, clipPaths and masks. Reference definitions only by local #id.',
  '- Never use <script>, <foreignObject>, <image>, external href/url references, event handler attributes, CSS @import or web fonts.',
  '- Avoid <text>; draw any lettering as paths.',
  '- Keep markup clean and editable: meaningful ids, grouped parts, rounded coordinates (at most 2 decimals), no hidden or redundant shapes.',
].join('\n')

// SVG content that could execute code or load external resources.
const FORBIDDEN_SVG = [
  /<script/i,
  /<foreignObject/i,
  /<image/i,
  /\son[a-z]+\s*=/i,
  /href\s*=\s*["'](?!#)/i,
  /url\(\s*["']?(?!#)/i,
  /@import/i,
]

const timestamp = () => new Date().toISOString().replace(/[:.]/g, '-')

async function run(fn: () => Promise<string[]>): Promise<CallToolResult> {
  try {
    return { content: [{ type: 'text', text: (await fn()).join('\n') }] }
  } catch (err) {
    const text = err instanceof Error ? err.message : String(err)
    return { content: [{ type: 'text', text }], isError: true }
  }
}

// Tools return only paths and sizes. Base64 image data would exceed Claude
// Code's tool-output token limit.
async function save(name: string, data: Buffer | string): Promise<string> {
  const file = path.join(OUT_DIR, name)
  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(file, data)
  return file
}

async function saveImage(name: string, image: Buffer): Promise<string> {
  const { width, height } = await dimensions(image)
  return `${await save(name, image)} (${width}×${height})`
}

const pngPart = (png: Buffer): Part => ({
  inlineData: { mimeType: 'image/png', data: png.toString('base64') },
})

async function referenceParts(paths: string[] = []): Promise<Part[]> {
  return Promise.all(
    paths.map(async (p) => {
      const file = resolveInside(p, READABLE_ROOTS)
      const ext = path.extname(file).toLowerCase()
      const bytes = await readFile(file)
      // Gemini doesn't accept SVG input, so rasterise it first.
      if (ext === '.svg') return pngPart(await toPng(bytes))
      const mimeType = REFERENCE_MIME.get(ext)
      if (!mimeType)
        throw new Error(
          `Unsupported reference image "${p}" (use png, jpg, webp or svg)`,
        )
      return { inlineData: { mimeType, data: bytes.toString('base64') } }
    }),
  )
}

async function generateRaster({
  prompt,
  aspectRatio,
  imageSize,
  references,
}: {
  prompt: string
  aspectRatio?: AspectRatio
  imageSize: ImageSize
  references?: string[]
}): Promise<Buffer> {
  const res = await ai.models.generateContent({
    model: IMAGE_MODEL,
    contents: [
      {
        role: 'user',
        parts: [...(await referenceParts(references)), { text: prompt }],
      },
    ],
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio,
        ...(SUPPORTS_IMAGE_SIZE ? { imageSize } : {}),
      },
    },
  })
  const candidate = res.candidates?.[0]
  // Gemini 3 can emit intermediate "thought" images; the final one comes last.
  const data = candidate?.content?.parts
    ?.filter((p) => p.inlineData?.data && !p.thought)
    .at(-1)?.inlineData?.data
  if (!data) {
    const reason =
      candidate?.finishReason ?? res.promptFeedback?.blockReason ?? 'unknown'
    throw new Error(
      `No image returned (reason: ${reason}). ${res.text ?? ''}`.trim(),
    )
  }
  return toPng(Buffer.from(data, 'base64'))
}

function assertSafeSvg(svg: string) {
  const forbidden = FORBIDDEN_SVG.find((re) => re.test(svg))
  if (forbidden)
    throw new Error(`SVG contains forbidden content (${forbidden}).`)
}

// Rasterising also validates that the SVG parses.
async function renderSvg(svg: string): Promise<Buffer> {
  try {
    return await toPng(Buffer.from(svg), 1024)
  } catch (err) {
    throw new Error(
      `SVG failed to render (${String(err)}):\n${svg.slice(0, 2000)}`,
    )
  }
}

async function generateSvg({
  prompt,
  parts,
  width,
  height,
}: {
  prompt: string
  parts: Part[]
  width: number
  height: number
}): Promise<{ svg: string; preview: Buffer }> {
  const res = await ai.models.generateContent({
    model: SVG_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          ...parts,
          { text: `${prompt}\n\nUse viewBox="0 0 ${width} ${height}".` },
        ],
      },
    ],
    config: { systemInstruction: SVG_SYSTEM },
  })
  const text = res.text ?? ''
  const match = text.match(/<svg[\s\S]*<\/svg>/i)
  if (!match)
    throw new Error(`Model did not return an SVG:\n${text.slice(0, 2000)}`)
  const svg = match[0].replace(
    /^<svg(?![^>]*\sxmlns=)/i,
    '<svg xmlns="http://www.w3.org/2000/svg"',
  )
  assertSafeSvg(svg)
  return { svg, preview: await renderSvg(svg) }
}

server.registerTool(
  'generate_image',
  {
    description: [
      'Generate a high-quality raster image with Gemini and save it as PNG.',
      'Pass width/height for an exact output size: Gemini renders at the closest supported aspect ratio and the result is letterboxed (never cropped) to fit; the full-resolution original is kept as <name>-source.png.',
      'Use transparent=true to remove the background. Use generate_logo for logos/app icons and generate_svg for vector output.',
    ].join(' '),
    inputSchema: {
      prompt: z.string().min(1).max(4000),
      filename: filenameSchema,
      aspect_ratio: z
        .enum(ASPECT_RATIOS)
        .optional()
        .describe(
          'Defaults to the ratio closest to width:height, else chosen by the model.',
        ),
      image_size: z
        .enum(IMAGE_SIZES)
        .default('2K')
        .describe('Generation resolution; 4K is slower and costlier.'),
      width: dimensionSchema.optional(),
      height: dimensionSchema.optional(),
      transparent: z
        .boolean()
        .default(false)
        .describe(
          'Generate on a solid background, then key it out to transparency.',
        ),
      reference_images: referenceImagesSchema,
    },
  },
  async ({
    prompt,
    filename,
    aspect_ratio,
    image_size,
    width,
    height,
    transparent,
    reference_images,
  }) =>
    run(async () => {
      const aspectRatio =
        aspect_ratio ??
        (width && height ? closestAspectRatio(width, height) : undefined)
      const generated = await generateRaster({
        prompt: transparent ? `${prompt}\n\n${TRANSPARENT_HINT}` : prompt,
        aspectRatio,
        imageSize: image_size,
        references: reference_images,
      })
      const image = transparent ? await removeBackground(generated) : generated
      const base = filename ?? timestamp()
      const lines = [
        `Model: ${IMAGE_MODEL}, aspect ratio ${aspectRatio ?? 'auto'}, size ${image_size}`,
      ]

      if (!width && !height)
        return [`Saved: ${await saveImage(`${base}.png`, image)}`, ...lines]

      const source = await dimensions(image)
      const resized = await fitNoCrop(image, {
        width,
        height,
        background: transparent ? TRANSPARENT : await detectBorderColor(image),
      })
      lines.unshift(
        `Saved: ${await saveImage(`${base}.png`, resized)}`,
        `Source: ${await saveImage(`${base}-source.png`, image)}`,
      )
      const scale = Math.min(
        width ? width / source.width : Infinity,
        height ? height / source.height : Infinity,
      )
      if (scale > 1)
        lines.push(
          `Warning: upscaled ${scale.toFixed(2)}×; use image_size 4K for a sharper result.`,
        )
      return lines
    }),
)

server.registerTool(
  'generate_logo',
  {
    description: [
      'Generate an app logo / icon mark (flat, bold, centred) as a square PNG: a 1024px master plus optional extra sizes.',
      'Pass existing brand assets (e.g. apps/mobile/assets/icon.png) as reference_images to keep the style consistent.',
      'Transparent by default; set transparent=false for iOS app icons (must be opaque) or when the brief specifies a background colour.',
    ].join(' '),
    inputSchema: {
      prompt: z
        .string()
        .min(1)
        .max(4000)
        .describe('Brand / concept brief for the logo.'),
      filename: filenameSchema,
      reference_images: referenceImagesSchema,
      transparent: z.boolean().default(true),
      padding_percent: z
        .number()
        .min(0)
        .max(40)
        .default(10)
        .describe(
          'Empty margin on each side. ~20 fits the Android adaptive-icon safe zone.',
        ),
      sizes: z
        .array(z.number().int().min(16).max(4096))
        .max(12)
        .optional()
        .describe('Extra square PNG sizes in px, e.g. [512, 192, 180, 48].'),
    },
  },
  async ({
    prompt,
    filename,
    reference_images,
    transparent,
    padding_percent,
    sizes,
  }) =>
    run(async () => {
      const background = transparent
        ? TRANSPARENT_HINT
        : 'Background: plain and uniform — the colour from the brief if one is given, otherwise white.'
      const referenceHint = reference_images?.length
        ? '\nMatch the brand style, colours and shapes of the attached reference image(s).'
        : ''
      const generated = await generateRaster({
        prompt: `${LOGO_GUIDE}\n${background}${referenceHint}\n\nBrief: ${prompt}`,
        aspectRatio: '1:1',
        imageSize: '2K',
        references: reference_images,
      })
      const keyed = transparent ? await removeBackground(generated) : generated
      const fill = transparent
        ? TRANSPARENT
        : await detectBorderColor(generated)
      const padded = await padSquare(keyed, padding_percent, fill)
      const base = filename ?? `logo-${timestamp()}`

      const lines = [
        `Saved: ${await saveImage(
          `${base}.png`,
          await fitNoCrop(padded, {
            width: LOGO_MASTER_SIZE,
            height: LOGO_MASTER_SIZE,
            background: fill,
          }),
        )}`,
      ]
      for (const size of sizes ?? []) {
        const resized = await fitNoCrop(padded, {
          width: size,
          height: size,
          background: fill,
        })
        lines.push(`Saved: ${await saveImage(`${base}-${size}.png`, resized)}`)
      }
      lines.push(
        `Model: ${IMAGE_MODEL}, transparent: ${transparent}, padding: ${padding_percent}%`,
      )
      return lines
    }),
)

server.registerTool(
  'generate_svg',
  {
    description: [
      'Have a Gemini model write a clean, editable SVG (icons, logos, simple illustrations). Takes 1-2 minutes.',
      'Saves <name>.svg plus a rendered <name>-preview.png — Read the preview to check the result and iterate.',
      'Pass a raster logo in reference_images to recreate it as a vector.',
    ].join(' '),
    inputSchema: {
      prompt: z.string().min(1).max(4000),
      filename: filenameSchema,
      reference_images: referenceImagesSchema,
      width: dimensionSchema.default(1024).describe('viewBox width'),
      height: dimensionSchema.default(1024).describe('viewBox height'),
    },
  },
  async ({ prompt, filename, reference_images, width, height }) =>
    run(async () => {
      const { svg, preview } = await generateSvg({
        prompt,
        parts: await referenceParts(reference_images),
        width,
        height,
      })
      const base = filename ?? `svg-${timestamp()}`
      return [
        `Saved: ${await save(`${base}.svg`, svg)} (${Buffer.byteLength(svg)} bytes)`,
        `Preview: ${await saveImage(`${base}-preview.png`, preview)}`,
        `Model: ${SVG_MODEL}`,
      ]
    }),
)

server.registerTool(
  'resize_image',
  {
    description: [
      'Resize an existing image (png, jpg, webp or svg) without cropping and save it as PNG in the output directory.',
      'With both width and height the image is scaled to fit and letterboxed; with one it scales proportionally.',
      'Padding defaults to the image border colour (transparent if the border is transparent). The source is never modified.',
    ].join(' '),
    inputSchema: {
      path: z.string().describe('Repo-relative path of the image to resize.'),
      width: dimensionSchema.optional(),
      height: dimensionSchema.optional(),
      filename: filenameSchema,
      trim: z
        .boolean()
        .default(false)
        .describe('Trim uniform/transparent margins before resizing.'),
      background: hexColorSchema
        .optional()
        .describe('Padding colour as hex, e.g. #FFFFFF or #00000000.'),
    },
  },
  async ({
    path: input,
    width,
    height,
    filename,
    trim: shouldTrim,
    background,
  }) =>
    run(async () => {
      if (!width && !height) throw new Error('Provide width, height, or both.')
      const file = resolveInside(input, READABLE_ROOTS)
      const loaded = await toPng(
        await readFile(file),
        Math.max(width ?? 0, height ?? 0),
      )
      const image = shouldTrim ? await trim(loaded) : loaded
      const resized = await fitNoCrop(image, {
        width,
        height,
        background: background ?? (await detectBorderColor(image)),
      })
      const name = path
        .parse(file)
        .name.replace(/[^\w-]/g, '-')
        .slice(0, 40)
      const base = filename ?? `${name}-${width ?? 'auto'}x${height ?? 'auto'}`
      return [`Saved: ${await saveImage(`${base}.png`, resized)}`]
    }),
)

server.registerTool(
  'generate_favicon',
  {
    description: [
      'Create a complete favicon set in <output dir>/<filename>/: favicon.ico (16/32/48), icon-192.png, icon-512.png, apple-icon.png (180, opaque), icon.svg (when available) and preview-16px.png (the 16px icon magnified; Read it to judge tab legibility).',
      'Either design a new mark from an idea (`prompt`, optionally with reference_images) or convert an existing png/jpg/webp/svg (`source`).',
      'File names follow the Next.js app/ conventions.',
    ].join(' '),
    inputSchema: {
      prompt: z
        .string()
        .min(1)
        .max(4000)
        .optional()
        .describe(
          'Creative idea for a new favicon. Mutually exclusive with source.',
        ),
      source: z
        .string()
        .optional()
        .describe(
          'Repo-relative existing image (png, jpg, webp or svg) to turn into a favicon set. An SVG source is also copied as icon.svg.',
        ),
      filename: filenameSchema.describe(
        'Output folder name. Defaults to favicon-<timestamp>.',
      ),
      reference_images: referenceImagesSchema,
      svg: z
        .boolean()
        .default(false)
        .describe(
          'Also have the SVG model draw icon.svg from the mark (adds 1-2 minutes). Not needed when source is an SVG.',
        ),
      background: hexColorSchema
        .optional()
        .describe(
          'Opaque fill for apple-icon.png (iOS has no transparency). Defaults to the source border colour, else white.',
        ),
    },
  },
  async ({ prompt, source, filename, reference_images, svg, background }) =>
    run(async () => {
      if (Boolean(prompt) === Boolean(source))
        throw new Error('Provide either prompt or source (exactly one).')

      let mark: Buffer
      let vector: string | undefined
      if (source) {
        const file = resolveInside(source, READABLE_ROOTS)
        const bytes = await readFile(file)
        if (path.extname(file).toLowerCase() === '.svg') {
          vector = bytes.toString('utf8')
          assertSafeSvg(vector)
        }
        mark = await toPng(bytes, 1024)
      } else {
        const referenceHint = reference_images?.length
          ? '\nDerive the mark from the attached reference image(s), simplified for tiny sizes.'
          : ''
        const generated = await generateRaster({
          prompt: `${FAVICON_GUIDE}\n${TRANSPARENT_HINT}${referenceHint}\n\nIdea: ${prompt}`,
          aspectRatio: '1:1',
          imageSize: '1K',
          references: reference_images,
        })
        mark = await removeBackground(generated)
      }

      if (!vector && svg) {
        const idea = prompt ? `\n\nOriginal idea: ${prompt}` : ''
        ;({ svg: vector } = await generateSvg({
          prompt: `Recreate the attached favicon mark as a minimal SVG that stays legible at 16px. Keep its shapes and colours, with no background unless the mark has one.${idea}`,
          parts: [pngPart(mark)],
          width: 512,
          height: 512,
        }))
      }

      const border = await detectBorderColor(mark)
      const tab = await padSquare(mark, FAVICON_PADDING, border)
      const appleFill = background
        ? hexToRgba(background)
        : border.alpha === 1
          ? border
          : WHITE
      const opaqueFill = { ...appleFill, alpha: 1 }
      const apple = await padSquare(mark, APPLE_ICON_PADDING, opaqueFill)

      const dir = filename ?? `favicon-${timestamp()}`
      const ico = encodeIco(
        await Promise.all(
          FAVICON_ICO_SIZES.map(async (size) => ({
            size,
            png: await iconPng(tab, size),
          })),
        ),
      )
      const lines = [
        `Saved: ${await save(`${dir}/favicon.ico`, ico)} (${FAVICON_ICO_SIZES.join('/')}px)`,
      ]
      if (vector) lines.push(`Saved: ${await save(`${dir}/icon.svg`, vector)}`)
      for (const size of FAVICON_MANIFEST_SIZES) {
        const icon = await iconPng(tab, size)
        lines.push(`Saved: ${await saveImage(`${dir}/icon-${size}.png`, icon)}`)
      }
      const appleIcon = await fitNoCrop(apple, {
        width: APPLE_ICON_SIZE,
        height: APPLE_ICON_SIZE,
        background: opaqueFill,
      })
      lines.push(
        `Saved: ${await saveImage(`${dir}/apple-icon.png`, appleIcon)}`,
      )
      const preview = await magnify(await iconPng(tab, 16), 256)
      lines.push(
        `Preview: ${await saveImage(`${dir}/preview-16px.png`, preview)}`,
        '',
        'Next.js: copy favicon.ico, icon.svg and apple-icon.png into app/.',
        `Web manifest icons: ${JSON.stringify(
          FAVICON_MANIFEST_SIZES.map((size) => ({
            src: `/icon-${size}.png`,
            sizes: `${size}x${size}`,
            type: 'image/png',
          })),
        )}`,
      )
      return lines
    }),
)

await server.connect(new StdioServerTransport())
