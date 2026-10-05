import { classMerge } from '@app/ui/lib/utils'
import React from 'react'

import { Eyebrow } from './Eyebrow'

interface SectionProps {
  children: React.ReactNode
  /** Small uppercase label above the title. */
  eyebrow?: string
  title?: string
  /** Intro paragraph between the title and the content. */
  lead?: string
  id?: string
  /** Alternating page bands: plain white, or the tinted one. */
  surface?: 'plain' | 'tint'
  className?: string
  /** Headings are centred by default; opt out for asymmetric sections. */
  centered?: boolean
}

/**
 * One marketing section: the vertical rhythm, the page band and the 1200px
 * content column.
 *
 * `scroll-mt-20` clears the 64px sticky navbar so an anchored section lands
 * with its heading visible rather than tucked behind the header.
 */
export const Section = ({
  children,
  eyebrow,
  title,
  lead,
  id,
  surface = 'plain',
  className,
  centered = true,
}: SectionProps) => (
  <section
    id={id}
    tabIndex={id ? -1 : undefined}
    className={classMerge(
      'py-section lg:py-section-lg scroll-mt-20 outline-none',
      surface === 'tint' && 'bg-slate-50/70',
      className,
    )}>
    <div className="max-w-content mx-auto w-full px-4 md:px-8">
      {(eyebrow || title || lead) && (
        <div
          className={classMerge(
            'mb-10 flex flex-col gap-3 lg:mb-14',
            centered && 'items-center text-center',
          )}>
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          {title && (
            <h2
              className={classMerge(
                'type-h2 max-w-2xl text-slate-900',
                centered && 'mx-auto',
              )}>
              {title}
            </h2>
          )}
          {lead && (
            <p
              className={classMerge(
                'max-w-2xl text-base text-slate-500',
                centered && 'mx-auto',
              )}>
              {lead}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  </section>
)
