import { Link } from '@/i18n/routing'
import { siteLinks } from '@/lib/marketing/siteLinks'
import { brand } from '@app/common'
import { AppLogo } from '@app/ui'
import { useTranslations } from 'next-intl'
import React from 'react'

import { LocaleSwitcher } from './LocaleSwitcher'
import { DesktopNavLinks, MobileNavMenu } from './SiteNavLinks'
import { StickyHeader } from './StickyHeader'

/**
 * The one navbar every marketing page shares, so moving between the home
 * and about pages never feels like leaving the site.
 *
 * A server component: the logo and labels render here, and only the parts
 * that need the current path or menu state (`SiteNavLinks`) ship as client
 * code. The call-to-action button is an in-page anchor — each page carries its own
 * `#get-started` section. It only shows from `md` up: on mobile, each page's
 * `MobileBottomCTA` carries it instead.
 */
export const SiteNavbar = () => {
  const tNav = useTranslations('nav')
  const tMarketing = useTranslations('marketing')

  const links = siteLinks.map(({ key, href }) => ({ label: tNav(key), href }))
  const ctaLabel = tMarketing('getStarted')

  return (
    <StickyHeader>
      <div className="max-w-content mx-auto flex h-16 w-full items-center justify-between gap-4 px-4 md:px-8">
        <div className="flex items-center gap-3">
          <MobileNavMenu links={links} ctaLabel={ctaLabel} />

          <Link href="/" className="flex items-center gap-2 outline-none">
            <AppLogo className="text-primary h-7 w-7 shrink-0" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              {brand.displayName}
            </span>
          </Link>
        </div>

        <DesktopNavLinks links={links} />

        <div className="flex items-center gap-3 sm:gap-4">
          <LocaleSwitcher />

          <a
            href="#get-started"
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring hidden h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 md:inline-flex">
            {ctaLabel}
          </a>
        </div>
      </div>
    </StickyHeader>
  )
}
