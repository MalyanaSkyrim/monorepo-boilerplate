/**
 * The site's top-level destinations, shared by the navbar and the footer so
 * the marketing pages always offer the same way around.
 *
 * `key` is a `nav.*` translation key. Features and FAQ point at the home
 * page's sections from everywhere, so the link lands in the same place
 * whichever page the visitor is on.
 */
export const siteLinks = [
  { key: 'features', href: '/#features' },
  { key: 'faq', href: '/#faq' },
  { key: 'about', href: '/about' },
] as const

export interface SiteNavLink {
  label: string
  href: string
}
