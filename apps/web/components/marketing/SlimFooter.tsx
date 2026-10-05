import { siteLinks } from '@/lib/marketing/siteLinks'
import { brand } from '@app/common'
import { AppLogo } from '@app/ui'
import { useTranslations } from 'next-intl'
import React from 'react'

import { LocaleSwitcher } from './LocaleSwitcher'
import { SiteLink } from './SiteLink'

interface SlimFooterProps {
  /** The whole copyright sentence, year already interpolated by the caller. */
  copyright: string
  tagline: string
  platformHeading: string
}

/**
 * Site footer.
 *
 * The platform column lists the same `siteLinks` as the navbar. Add legal
 * links here when your `/privacy` and `/terms` pages ship.
 */
export const SlimFooter = ({
  copyright,
  tagline,
  platformHeading,
}: SlimFooterProps) => {
  const tNav = useTranslations('nav')

  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="max-w-content mx-auto w-full px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2">
              <AppLogo className="text-primary h-6 w-6 shrink-0" />
              <span className="text-base font-bold tracking-tight text-slate-900">
                {brand.displayName}
              </span>
            </span>

            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              {tagline}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {platformHeading}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {siteLinks.map(({ key, href }) => (
                <li key={href}>
                  <SiteLink
                    href={href}
                    className="text-slate-500 transition-colors hover:text-slate-900">
                    {tNav(key)}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500">{copyright}</p>
          <LocaleSwitcher />
        </div>
      </div>
    </footer>
  )
}
