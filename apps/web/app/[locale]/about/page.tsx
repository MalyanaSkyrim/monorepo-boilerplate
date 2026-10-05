import { CTAButton } from '@/components/marketing/CTAButton'
import { Eyebrow } from '@/components/marketing/Eyebrow'
import { FeatureCard } from '@/components/marketing/FeatureCard'
import { Reveal } from '@/components/marketing/Reveal'
import { Section } from '@/components/marketing/Section'
import { SiteNavbar } from '@/components/marketing/SiteNavbar'
import { SlimFooter } from '@/components/marketing/SlimFooter'
import { MetaPixel } from '@/lib/tracking/MetaPixel'
import { Compass, Handshake, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import React from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('about.meta')

  return {
    title: t('title'),
    description: t('description'),
    openGraph: { title: t('title'), description: t('description') },
  }
}

const AboutPage = async () => {
  const t = await getTranslations('about')
  const tMarketing = await getTranslations('marketing')
  const tFooter = await getTranslations('footer')

  const values = [
    { key: 'one', Icon: Compass },
    { key: 'two', Icon: Handshake },
    { key: 'three', Icon: ShieldCheck },
  ] as const

  return (
    <>
      <MetaPixel contentName="about" />
      <SiteNavbar />

      <main className="flex-1">
        <Section>
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <Eyebrow>{t('hero.eyebrow')}</Eyebrow>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {t('hero.title')}
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-500">
              {t('hero.subtitle')}
            </p>
          </Reveal>
        </Section>

        <Section
          surface="tint"
          eyebrow={t('story.eyebrow')}
          title={t('story.title')}>
          <div className="mx-auto flex max-w-2xl flex-col gap-5 text-base leading-relaxed text-slate-600">
            <p>{t('story.p1')}</p>
            <p>{t('story.p2')}</p>
          </div>
        </Section>

        <Section eyebrow={t('values.eyebrow')} title={t('values.title')}>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ key, Icon }, index) => (
              <Reveal key={key} delay={index * 80}>
                <FeatureCard
                  title={t(`values.${key}.title`)}
                  body={t(`values.${key}.body`)}
                  icon={<Icon className="h-5 w-5" />}
                />
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <CTAButton href="/#get-started">
              {tMarketing('getStarted')}
            </CTAButton>
          </div>
        </Section>
      </main>

      <SlimFooter
        copyright={tMarketing('copyright', { year: new Date().getFullYear() })}
        tagline={tFooter('tagline')}
        platformHeading={tFooter('platform')}
      />
    </>
  )
}

export default AboutPage
