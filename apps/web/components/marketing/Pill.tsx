import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

type PillVariant = 'default' | 'status' | 'preview' | 'success'

interface PillProps {
  children: React.ReactNode
  variant?: PillVariant
  className?: string
}

const variants: Record<PillVariant, string> = {
  /** Neutral pill: cities, tags. */
  default: 'border border-slate-200 bg-white text-slate-700 shadow-sm',
  /** The early-access treatment. */
  status: 'bg-primary-0 text-primary-300',
  /** Marks every product mockup on the page. */
  preview: 'border border-slate-200 bg-white text-slate-500',
  /** Availability / reassurance. */
  success:
    'bg-[rgb(var(--color-success-0))] text-[rgb(var(--color-success-300))]',
}

/**
 * The design system's pill. `@app/ui` has no badge component, and the numeric
 * `success` scale generates no Tailwind classes in the shared config, so the
 * green is read straight from its CSS variable.
 */
export const Pill = ({
  children,
  variant = 'default',
  className,
}: PillProps) => (
  <span
    className={classMerge(
      'inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
      variants[variant],
      className,
    )}>
    {children}
  </span>
)
