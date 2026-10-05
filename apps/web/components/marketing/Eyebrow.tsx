import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

/** Small uppercase label that introduces a section. */
export const Eyebrow = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <p
    className={classMerge(
      'text-primary-300 text-xs font-bold uppercase tracking-[0.12em]',
      className,
    )}>
    {children}
  </p>
)
