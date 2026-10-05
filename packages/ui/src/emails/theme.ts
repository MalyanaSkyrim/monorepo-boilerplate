/**
 * Email design tokens. Email clients ignore CSS variables and stylesheets, so
 * the App Boilerplate web palette (`styles/themes/web.css`) is inlined here as hex.
 */
export const emailColors = {
  primary: '#3F46F9',
  primaryDeep: '#2F35DC',
  primaryTint: '#ECEDFE',
  heroSubtitle: '#DADCFE',
  panel: '#F7F7FF',
  ink: '#0F172A',
  body: '#475569',
  muted: '#94A3B8',
  border: '#E2E8F0',
  page: '#F4F5FB',
  white: '#FFFFFF',
} as const

export const emailFont =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"

/**
 * Public URL that serves the email images (`logo.png`, `hero.jpg`). Email
 * clients need absolute URLs, so host them on your deployed site.
 * TODO: replace with your own domain.
 */
const emailAssetsUrl = 'https://example.com/email'

/** Mirrors `brand.displayName` in `@app/common`, which `@app/ui` doesn't depend on. */
export const emailBrand = {
  name: 'App Boilerplate',
  assetsUrl: emailAssetsUrl,
  /** PNG app icon; email clients block SVG. */
  logoUrl: `${emailAssetsUrl}/logo.png`,
  /** Hero photo with the brand overlay baked in, for the hero band. */
  heroImageUrl: `${emailAssetsUrl}/hero.jpg`,
} as const
