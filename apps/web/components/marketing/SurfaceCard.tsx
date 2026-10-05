import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

interface SurfaceCardProps {
  children: React.ReactNode
  /** Adds the hover rise. Off for cards that are not part of a grid. */
  interactive?: boolean
  className?: string
}

/**
 * The one card surface on the site.
 *
 * Shared card surface (`rounded-xl border bg-white shadow-sm`,
 * see its dashboard cards) so the marketing page and the product read as one
 * design system. Everything that looks like a card on this page goes through
 * here rather than repeating the recipe.
 */
export const SurfaceCard = ({
  children,
  interactive = false,
  className,
}: SurfaceCardProps) => (
  <div
    className={classMerge(
      'rounded-xl border border-slate-200/70 bg-white shadow-sm',
      interactive && 'card-lift',
      className,
    )}>
    {children}
  </div>
)
