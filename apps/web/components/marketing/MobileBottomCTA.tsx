'use client'

import { classMerge } from '@app/ui/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'

interface MobileBottomCTAProps {
  label?: string
}

/**
 * Sticky bottom CTA visible exclusively on mobile viewports.
 * Gives mobile users immediate access to the primary call to action as they scroll.
 */
export const MobileBottomCTA = ({ label }: MobileBottomCTAProps) => {
  const tMarketing = useTranslations('marketing')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Appear after scrolling past the first 160px of the hero
      setVisible(window.scrollY > 160)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <div
      role="complementary"
      aria-label="Primary call to action"
      className={classMerge(
        'fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md transition-transform duration-300 md:hidden',
        'safe-bottom',
      )}>
      <a
        href="#get-started"
        className="bg-primary text-primary-foreground focus-visible:ring-ring flex h-12 w-full items-center justify-center gap-2 rounded-lg px-6 text-sm font-bold shadow-md transition-colors focus-visible:outline-none focus-visible:ring-2">
        <span>{label ?? tMarketing('getStarted')}</span>
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  )
}
