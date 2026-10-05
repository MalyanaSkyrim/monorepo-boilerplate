import React from 'react'

import { SurfaceCard } from './SurfaceCard'

interface StepCardProps {
  /** 1-based position, rendered as `01`, `02`, … */
  step: number
  title: string
  body: string
  /** Short label under the body — what the step gives you, in three words. */
  tag: string
  /** Line art shown on the tinted panel at the top of the card. */
  art: React.ReactNode
}

/**
 * A numbered step: illustration panel, index badge, title, body, tag.
 *
 * The panel holds simple line art (an icon works well) rather than a
 * photograph, so every label on the page stays a translatable text layer.
 */
export const StepCard = ({ step, title, body, tag, art }: StepCardProps) => (
  <SurfaceCard interactive className="flex h-full flex-col gap-4 p-5">
    <div
      aria-hidden="true"
      className="from-primary-0 grid aspect-[16/10] place-items-center rounded-lg bg-gradient-to-br to-slate-50">
      <span className="text-primary-300/80">{art}</span>
    </div>

    <span
      aria-hidden="true"
      className="bg-primary-0 text-primary-300 grid h-9 w-9 place-items-center rounded-lg text-sm font-bold">
      {String(step).padStart(2, '0')}
    </span>

    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="flex-1 text-sm leading-relaxed text-slate-500">{body}</p>

    <p className="text-primary-300 text-[13px] font-semibold">{tag}</p>
  </SurfaceCard>
)
