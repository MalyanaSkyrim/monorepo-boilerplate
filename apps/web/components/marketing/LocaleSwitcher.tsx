'use client'

import { Link, usePathname } from '@/i18n/routing'
import { locales } from '@/lib/utils/locale.enum'
import { classMerge } from '@app/ui/lib/utils'
import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

/**
 * Inline locale switcher — `EN · FR`, as the design system specifies.
 *
 * Plain links rather than a dropdown: they need no JavaScript to work, search
 * engines can follow them to the alternate versions of the page, and they keep
 * the Radix select out of a landing page's first load.
 */
export const LocaleSwitcher = ({ className }: { className?: string }) => {
  const t = useTranslations('common')
  const pathname = usePathname()
  const active = useLocale()

  return (
    <nav aria-label={t('languages')} className={className}>
      <ul className="flex items-center gap-1">
        {locales.map((locale, index) => (
          <li key={locale} className="flex items-center gap-1">
            {index > 0 && (
              <span aria-hidden="true" className="text-border">
                ·
              </span>
            )}
            <Link
              href={pathname}
              locale={locale}
              aria-current={locale === active ? 'true' : undefined}
              className={classMerge(
                'type-label rounded px-1.5 py-1 uppercase transition-colors',
                locale === active
                  ? 'text-foreground font-bold'
                  : 'text-muted-foreground hover:text-foreground',
              )}>
              {locale}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
