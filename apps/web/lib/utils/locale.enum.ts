export const locales = ['en', 'fr'] as const

export type Locale = (typeof locales)[number]

/**
 * Widened copy so `includes` accepts an arbitrary string without an assertion.
 */
const localeList: readonly string[] = locales

/**
 * Deliberately zod-free: this module is pulled in by the i18n routing that
 * every client component imports, and a schema here would ship zod to the
 * browser on a marketing page that has no forms.
 */
export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && localeList.includes(value)
