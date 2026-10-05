import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

type ChipTone = 'primary' | 'success'

interface IconChipProps {
  children: React.ReactNode
  tone?: ChipTone
  /** `sm` is for inline chips; `md` is the card size. */
  size?: 'sm' | 'md'
  className?: string
}

const tones: Record<ChipTone, string> = {
  primary: 'bg-primary-0 text-primary-300',
  /**
   * The `success` scale sits outside `theme.extend.colors` in the shared
   * config and so generates no classes — the green is read from its variable,
   * the same way `Pill` does it.
   */
  success:
    'bg-[rgb(var(--color-success-0))] text-[rgb(var(--color-success-300))]',
}

/**
 * The tinted rounded-square that holds every icon on the page.
 *
 * Squares rather than circles: the marketing layout uses them
 * at card scale, where a circle reads as an avatar.
 */
export const IconChip = ({
  children,
  tone = 'primary',
  size = 'md',
  className,
}: IconChipProps) => (
  <span
    aria-hidden="true"
    className={classMerge(
      'inline-flex shrink-0 items-center justify-center rounded-lg',
      size === 'md' ? 'h-11 w-11' : 'h-8 w-8',
      tones[tone],
      className,
    )}>
    {children}
  </span>
)
