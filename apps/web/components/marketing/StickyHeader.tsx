'use client'

import { classMerge } from '@app/ui/lib/utils'
import React, { useEffect, useState } from 'react'

/**
 * The sticky header shell: lifts off the page once the visitor scrolls.
 *
 * Only the `<header>` element is a client component. Everything inside it —
 * logo, links, call to action — is passed in as already-rendered server
 * children, which keeps the `@app/ui` barrel (and everything it re-exports)
 * out of the client bundle. Importing it from a `'use client'` module pulled
 * roughly 60 kB of unrelated components onto an ad landing page.
 */
export const StickyHeader = ({ children }: { children: React.ReactNode }) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={classMerge(
        'sticky top-0 z-40 w-full border-b transition-colors',
        scrolled
          ? 'border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-md'
          : 'border-transparent bg-white',
      )}>
      {children}
    </header>
  )
}
