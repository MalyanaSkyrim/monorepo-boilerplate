'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/ui'
import React from 'react'

import { SurfaceCard } from './SurfaceCard'

export interface FAQEntry {
  question: string
  answer: string
}

interface FAQAccordionProps {
  entries: FAQEntry[]
}

/**
 * FAQ rows inside one card, divided rather than boxed individually.
 *
 * The shared Accordion defaults to `text-sm`, which is too small for a
 * marketing page, so the trigger is resized.
 *
 * Note: `AccordionContent` applies `className` to its inner wrapper, not the
 * animated outer element.
 */
export const FAQAccordion = ({ entries }: FAQAccordionProps) => (
  <SurfaceCard className="mx-auto max-w-3xl px-6">
    <Accordion
      type="single"
      collapsible
      className="divide-y divide-slate-200/70">
      {entries.map((entry, index) => (
        <AccordionItem
          key={entry.question}
          value={`faq-${index}`}
          className="border-b-0">
          <AccordionTrigger className="py-5 text-left text-base font-bold text-slate-900 hover:no-underline">
            {entry.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 pr-8 text-sm leading-relaxed text-slate-500">
            {entry.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </SurfaceCard>
)
