import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

/** Where the primary call to action lives. Every CTA button points here by default. */
export const CTA_ANCHOR = '#get-started'

interface CTAButtonProps {
  children: React.ReactNode
  /** Defaults to the call-to-action section of the page. */
  href?: string
  variant?: 'primary' | 'secondary'
  /** Full width on mobile is the design system default; the navbar opts out. */
  fullWidthOnMobile?: boolean
  className?: string
}

/**
 * The site's call to action.
 *
 * A plain anchor to a section of the same page, which is why this is a server
 * component with no hooks and no Suspense boundary. Pass `href` to send
 * visitors to a signup page or a store listing instead.
 *
 * `Button` from `@app/ui` can't be used with `asChild` here — its `Slot`
 * merges onto an inner wrapper div rather than the link — and composing
 * `buttonVariants` does not work either: that preset carries `rounded-md`,
 * and tailwind-merge does not treat the custom `rounded-btn` as a radius, so
 * it would keep both and the preset would win. Hence the classes long-hand.
 */
export const CTAButton = ({
  children,
  href = CTA_ANCHOR,
  variant = 'primary',
  fullWidthOnMobile = true,
  className,
}: CTAButtonProps) => (
  <a
    href={href}
    className={classMerge(
      'focus-visible:ring-ring inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-6 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      variant === 'primary' &&
        'bg-primary text-primary-foreground hover:bg-primary/90',
      variant === 'secondary' &&
        'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
      fullWidthOnMobile ? 'w-full sm:w-auto sm:px-8' : 'w-auto',
      className,
    )}>
    {children}
  </a>
)
