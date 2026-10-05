/**
 * Utility script to parse Figma design tokens and convert them to the format
 * needed for the mobile-ui design system.
 *
 * This script:
 * - Converts hex colors to RGB format (space-separated values)
 * - Extracts color tokens for primary, error, warning, success, greyscale, and sky
 * - Extracts typography tokens
 * - Extracts shadow/effect tokens
 */

type HexColor = string // Format: "#rrggbbaa" or "#rrggbb"

interface FigmaColorToken {
  type: 'color'
  value: HexColor
  description?: string
}

interface FigmaShadowToken {
  type: 'custom-shadow'
  value: {
    shadowType: 'dropShadow'
    radius: number
    color: string
    offsetX: number
    offsetY: number
    spread: number
  }
}

interface FigmaTypographyToken {
  fontSize: { type: 'dimension'; value: number }
  lineHeight: { type: 'dimension'; value: number }
  letterSpacing: { type: 'dimension'; value: number }
  fontWeight: { type: 'number'; value: number }
  fontFamily: { type: 'string'; value: string }
}

/**
 * Convert hex color to RGB format (space-separated values)
 * @param hex - Hex color string (with or without alpha)
 * @returns RGB string in format "r g b"
 */
export function hexToRgb(hex: HexColor): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Handle alpha channel if present (8 characters)
  if (hex.length === 8) {
    hex = hex.slice(0, 6)
  }

  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return `${r} ${g} ${b}`
}

/**
 * Extract color tokens from Figma tokens
 */
export function extractColorTokens(tokens: {
  color?: {
    primary?: Record<string, FigmaColorToken>
    greyscale?: Record<string, FigmaColorToken>
    alert?: {
      error?: Record<string, FigmaColorToken>
      warning?: Record<string, FigmaColorToken>
      success?: Record<string, FigmaColorToken>
    }
    additional?: {
      sky?: Record<string, FigmaColorToken>
    }
  }
}) {
  const colors: {
    primary?: Record<string, string>
    error?: Record<string, string>
    warning?: Record<string, string>
    success?: Record<string, string>
    greyscale?: Record<string, string>
    sky?: Record<string, string>
  } = {}

  // Primary colors
  if (tokens.color?.primary) {
    colors.primary = {}
    for (const [scale, token] of Object.entries(tokens.color.primary)) {
      if (token.type === 'color') {
        colors.primary[scale] = hexToRgb(token.value)
      }
    }
  }

  // Error colors
  if (tokens.color?.alert?.error) {
    colors.error = {}
    for (const [scale, token] of Object.entries(tokens.color.alert.error)) {
      if (token.type === 'color') {
        colors.error[scale] = hexToRgb(token.value)
      }
    }
  }

  // Warning colors
  if (tokens.color?.alert?.warning) {
    colors.warning = {}
    for (const [scale, token] of Object.entries(tokens.color.alert.warning)) {
      if (token.type === 'color') {
        colors.warning[scale] = hexToRgb(token.value)
      }
    }
  }

  // Success colors
  if (tokens.color?.alert?.success) {
    colors.success = {}
    for (const [scale, token] of Object.entries(tokens.color.alert.success)) {
      if (token.type === 'color') {
        colors.success[scale] = hexToRgb(token.value)
      }
    }
  }

  // Greyscale colors
  if (tokens.color?.greyscale) {
    colors.greyscale = {}
    for (const [scale, token] of Object.entries(tokens.color.greyscale)) {
      if (token.type === 'color') {
        colors.greyscale[scale] = hexToRgb(token.value)
      }
    }
  }

  // Sky colors
  if (tokens.color?.additional?.sky) {
    colors.sky = {}
    for (const [scale, token] of Object.entries(tokens.color.additional.sky)) {
      if (token.type === 'color') {
        colors.sky[scale] = hexToRgb(token.value)
      }
    }
  }

  return colors
}

/**
 * Extract typography tokens from Figma tokens
 */
export function extractTypographyTokens(tokens: {
  typography?: {
    heading?: Record<string, FigmaTypographyToken>
    body?: Record<string, Record<string, FigmaTypographyToken>>
  }
}) {
  const typography: {
    heading?: Record<string, FigmaTypographyToken>
    body?: Record<string, Record<string, FigmaTypographyToken>>
  } = {}

  if (tokens.typography?.heading) {
    typography.heading = tokens.typography.heading
  }

  if (tokens.typography?.body) {
    typography.body = tokens.typography.body
  }

  return typography
}

/**
 * Extract shadow tokens from Figma tokens
 */
export function extractShadowTokens(tokens: {
  effect?: {
    shadow?: Record<
      string,
      FigmaShadowToken | { [key: string]: FigmaShadowToken }
    >
    form?: {
      button?: Record<string, { [key: string]: FigmaShadowToken }>
      input?: Record<string, { [key: string]: FigmaShadowToken }>
      'checkbox & radio'?: Record<string, { [key: string]: FigmaShadowToken }>
      'notification & toast'?: Record<
        string,
        { [key: string]: FigmaShadowToken }
      >
    }
  }
}) {
  const shadows: {
    shadow?: Record<string, FigmaShadowToken | FigmaShadowToken[]>
    button?: Record<string, FigmaShadowToken[]>
    input?: Record<string, FigmaShadowToken[]>
    checkbox?: Record<string, FigmaShadowToken[]>
    notification?: Record<string, FigmaShadowToken[]>
  } = {}

  // General shadow tokens
  if (tokens.effect?.shadow) {
    shadows.shadow = {}
    for (const [name, shadow] of Object.entries(tokens.effect.shadow)) {
      if (shadow && typeof shadow === 'object' && 'type' in shadow) {
        shadows.shadow[name] = shadow as FigmaShadowToken
      }
    }
  }

  // Button shadows
  if (tokens.effect?.form?.button) {
    shadows.button = {}
    for (const [variant, shadowGroup] of Object.entries(
      tokens.effect.form.button,
    )) {
      const shadowArray: FigmaShadowToken[] = []
      for (const shadow of Object.values(shadowGroup)) {
        if (shadow && typeof shadow === 'object' && 'type' in shadow) {
          shadowArray.push(shadow as FigmaShadowToken)
        }
      }
      shadows.button[variant] = shadowArray
    }
  }

  // Input shadows
  if (tokens.effect?.form?.input) {
    shadows.input = {}
    for (const [variant, shadowGroup] of Object.entries(
      tokens.effect.form.input,
    )) {
      const shadowArray: FigmaShadowToken[] = []
      for (const shadow of Object.values(shadowGroup)) {
        if (shadow && typeof shadow === 'object' && 'type' in shadow) {
          shadowArray.push(shadow as FigmaShadowToken)
        }
      }
      shadows.input[variant] = shadowArray
    }
  }

  // Checkbox & Radio shadows
  if (tokens.effect?.form?.['checkbox & radio']) {
    shadows.checkbox = {}
    for (const [variant, shadowGroup] of Object.entries(
      tokens.effect.form['checkbox & radio'],
    )) {
      const shadowArray: FigmaShadowToken[] = []
      for (const shadow of Object.values(shadowGroup)) {
        if (shadow && typeof shadow === 'object' && 'type' in shadow) {
          shadowArray.push(shadow as FigmaShadowToken)
        }
      }
      shadows.checkbox[variant] = shadowArray
    }
  }

  // Notification & Toast shadows
  if (tokens.effect?.form?.['notification & toast']) {
    shadows.notification = {}
    for (const [variant, shadowGroup] of Object.entries(
      tokens.effect.form['notification & toast'],
    )) {
      const shadowArray: FigmaShadowToken[] = []
      for (const shadow of Object.values(shadowGroup)) {
        if (shadow && typeof shadow === 'object' && 'type' in shadow) {
          shadowArray.push(shadow as FigmaShadowToken)
        }
      }
      shadows.notification[variant] = shadowArray
    }
  }

  return shadows
}

/**
 * Convert Figma shadow token to CSS box-shadow format
 */
export function shadowTokenToCSS(shadow: FigmaShadowToken): string {
  const { offsetX, offsetY, radius, spread, color } = shadow.value
  // Convert hex color with alpha to rgba
  const rgbaColor = hexToRgba(color)
  return `${offsetX}px ${offsetY}px ${radius}px ${spread}px ${rgbaColor}`
}

/**
 * Convert hex color to rgba format
 */
function hexToRgba(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '')

  let r: number, g: number, b: number, a: number

  if (hex.length === 8) {
    // Has alpha channel
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
    a = parseInt(hex.substring(6, 8), 16) / 255
  } else if (hex.length === 6) {
    // No alpha, default to 1
    r = parseInt(hex.substring(0, 2), 16)
    g = parseInt(hex.substring(2, 4), 16)
    b = parseInt(hex.substring(4, 6), 16)
    a = 1
  } else {
    throw new Error(`Invalid hex color: ${hex}`)
  }

  return `rgba(${r}, ${g}, ${b}, ${a})`
}
