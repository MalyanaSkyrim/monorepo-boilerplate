/**
 * Single source of truth for product naming. Replace these placeholders
 * with your own brand when you start a project from this boilerplate.
 */
export const brand = {
  displayName: 'App Boilerplate',
  urls: {
    website: 'https://example.com',
    docs: 'https://example.com/docs',
  },
  supportEmail: 'support@example.com',
  defaultCurrency: 'USD',
  defaultLocale: 'en-US',
} as const

export type Brand = typeof brand
