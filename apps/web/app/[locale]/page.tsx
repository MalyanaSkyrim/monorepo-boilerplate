import { CTAButton } from '@/components/marketing/CTAButton'
import { FAQAccordion } from '@/components/marketing/FAQAccordion'
import { FeatureCard } from '@/components/marketing/FeatureCard'
import { MobileBottomCTA } from '@/components/marketing/MobileBottomCTA'
import { Pill } from '@/components/marketing/Pill'
import { Reveal } from '@/components/marketing/Reveal'
import { Section } from '@/components/marketing/Section'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SlimFooter } from '@/components/marketing/SlimFooter'
import { StepCard } from '@/components/marketing/StepCard'
import { MetaPixel } from '@/lib/tracking/MetaPixel'
import {
  ArrowRight,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('home.meta')

  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
  }
}

/**
 * Generic landing page: hero, features, how it works, FAQ and a closing call
 * to action. All copy lives in `locales/*.json` — replace it with your own.
 */
const HomePage = async () => {
  const t = await getTranslations('home')
  const tMarketing = await getTranslations('marketing')
  const tFooter = await getTranslations('footer')

  const features = [
    { key: 'one', Icon: Zap },
    { key: 'two', Icon: ShieldCheck },
    { key: 'three', Icon: Sparkles },
  ] as const

  const steps = [
    { key: 'one', Icon: UserPlus },
    { key: 'two', Icon: SlidersHorizontal },
    { key: 'three', Icon: Rocket },
  ] as const

  const faqEntries = (['q1', 'q2', 'q3', 'q4'] as const).map((key) => ({
    question: t(`faq.${key}.question`),
    answer: t(`faq.${key}.answer`),
  }))

  return (
    <>
      <MetaPixel contentName="home" />
      <SiteNavbar />

      <main className="flex-1">
        <Section>
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
            <Pill variant="status">{t('hero.badge')}</Pill>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              {t('hero.title')}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-500">
              {t('hero.subtitle')}
            </p>
            <div className="flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
              <CTAButton>
                {tMarketing('getStarted')}
                <ArrowRight className="h-4 w-4" />
              </CTAButton>
              <CTAButton href="#features" variant="secondary">
                {tMarketing('learnMore')}
              </CTAButton>
            </div>
            <p className="text-sm text-slate-500">{t('hero.note')}</p>
          </Reveal>
        </Section>

        <Section
          id="features"
          surface="tint"
          eyebrow={t('features.eyebrow')}
          title={t('features.title')}
          lead={t('features.lead')}>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 80}>
                <FeatureCard
                  title={t(`features.${key}.title`)}
                  body={t(`features.${key}.body`)}
                  icon={<Icon className="h-5 w-5" />}
                />
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="how-it-works"
          eyebrow={t('howItWorks.eyebrow')}
          title={t('howItWorks.title')}>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 80}>
                <StepCard
                  step={index + 1}
                  title={t(`howItWorks.${key}.title`)}
                  body={t(`howItWorks.${key}.body`)}
                  tag={t(`howItWorks.${key}.tag`)}
                  art={<Icon className="h-14 w-14" strokeWidth={1.25} />}
                />
              </Reveal>
            ))}
          </div>
        </Section>

        <Section
          id="faq"
          surface="tint"
          eyebrow={t('faq.eyebrow')}
          title={t('faq.title')}>
          <div className="mx-auto max-w-3xl">
            <FAQAccordion entries={faqEntries} />
          </div>
        </Section>

        <Section
          id="get-started"
          title={t('cta.title')}
          lead={t('cta.subtitle')}>
          <div className="flex justify-center">
            {/* TODO: point this at your signup page or app store listing. */}
            <CTAButton href="#">
              {t('cta.button')}
              <ArrowRight className="h-4 w-4" />
            </CTAButton>
          </div>
        </Section>
      </main>

      <SlimFooter
        copyright={tMarketing('copyright', { year: new Date().getFullYear() })}
        tagline={tFooter('tagline')}
        platformHeading={tFooter('platform')}
      />
      <MobileBottomCTA />
    </>
  )
}

export default HomePage
