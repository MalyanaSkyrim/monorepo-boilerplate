import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

import { IconChip } from './IconChip'
import { SurfaceCard } from './SurfaceCard'

interface FeatureCardProps {
  title: string
  body: string
  icon?: React.ReactNode
  /** Tint of the icon chip. Guarantee-flavoured cards take the green. */
  tone?: 'primary' | 'success'
  className?: string
}

/**
 * Card used for the problem and benefit grids: a tinted icon chip over a
 * title and a line of body copy.
 *
 * `h-full` matters: grids put these in a row, and French copy runs ~35%
 * longer than English, so cards must stretch to the tallest instead of
 * clipping.
 */
export const FeatureCard = ({
  title,
  body,
  icon,
  tone = 'primary',
  className,
}: FeatureCardProps) => (
  <SurfaceCard
    interactive
    className={classMerge('flex h-full flex-col gap-4 p-6', className)}>
    {icon && <IconChip tone={tone}>{icon}</IconChip>}
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="text-sm leading-relaxed text-slate-500">{body}</p>
  </SurfaceCard>
)
