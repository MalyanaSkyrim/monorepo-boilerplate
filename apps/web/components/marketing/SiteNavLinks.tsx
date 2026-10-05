'use client'

import { usePathname } from '@/i18n/routing'
import type { SiteNavLink } from '@/lib/marketing/siteLinks'
import { classMerge } from '@app/ui/lib/utils'
import { Menu, X } from 'lucide-react'
import React, { useState } from 'react'

import { SiteLink } from './SiteLink'

/**
 * The navbar's interactive parts: the ones that need the current path or
 * open/closed state. Labels arrive already translated from `SiteNavbar`, a
 * server component, so this module pulls in neither translations nor the
 * `@app/ui` barrel.
 */

/** `usePathname` from the i18n routing has the locale prefix stripped already. */
const useIsCurrent = () => {
  const pathname = usePathname()
  return (href: string) => pathname === href
}

export const DesktopNavLinks = ({ links }: { links: SiteNavLink[] }) => {
  const isCurrent = useIsCurrent()

  return (
    <nav
      aria-label="Main navigation"
      className="hidden items-center gap-7 md:flex lg:gap-8">
      {links.map((link) => {
        const current = isCurrent(link.href)

        return (
          <SiteLink
            key={link.href}
            href={link.href}
            aria-current={current ? 'page' : undefined}
            className={classMerge(
              'text-sm font-medium transition-colors hover:text-slate-900',
              current ? 'font-semibold text-slate-900' : 'text-slate-600',
            )}>
            {link.label}
          </SiteLink>
        )
      })}
    </nav>
  )
}

interface MobileNavMenuProps {
  links: SiteNavLink[]
  ctaLabel: string
}

/**
 * Hamburger button plus its dropdown. The dropdown is positioned against the
 * sticky `<header>`, so it can live here beside the button instead of being
 * a separate sibling that would need shared state.
 */
export const MobileNavMenu = ({ links, ctaLabel }: MobileNavMenuProps) => {
  const isCurrent = useIsCurrent()
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        className="focus-visible:ring-ring inline-flex h-9 w-9 items-center justify-center rounded-lg p-1.5 text-slate-700 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 md:hidden">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className="absolute inset-x-0 top-full border-t border-slate-200/80 bg-white px-4 py-5 shadow-lg md:hidden">
          <nav className="flex flex-col gap-3">
            {links.map((link) => {
              const current = isCurrent(link.href)

              return (
                <SiteLink
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={current ? 'page' : undefined}
                  className={classMerge(
                    'rounded-md px-3 py-2 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 hover:text-slate-900',
                    current && 'text-primary bg-slate-50',
                  )}>
                  {link.label}
                </SiteLink>
              )
            })}
            <div className="mt-2 border-t border-slate-100 pt-3">
              <a
                href="#get-started"
                onClick={close}
                className="bg-primary text-primary-foreground flex h-11 w-full items-center justify-center rounded-lg text-sm font-semibold shadow-sm">
                {ctaLabel}
              </a>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
