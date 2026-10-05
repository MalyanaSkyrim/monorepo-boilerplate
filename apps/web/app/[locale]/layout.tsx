import { Providers } from '@/components/providers'
import { fontIntegralCF, fontMono, fontSans, fontSatoshi } from '@/lib/fonts'
import { brand } from '@app/common'
import '@app/ui/globals.css'
import '@app/ui/themes/web.css'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import React from 'react'

import '../marketing.css'

export const metadata: Metadata = {
  title: brand.displayName,
  description: 'Replace this with a one-sentence description of your product.',
}

const Layout = async ({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params

  // Providing all messages to the client
  // side is the easiest way to get started

  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/*
         * `Reveal` starts its children transparent and reveals them from an
         * IntersectionObserver. With no JavaScript that observer never runs,
         * so the entrance is switched off entirely rather than leaving the
         * page blank.
         */}
        <noscript>
          <style>{'.reveal{opacity:1;transform:none}'}</style>
        </noscript>
      </head>
      <body
        className={`${fontSatoshi.variable} ${fontSans.variable} ${fontMono.variable} ${fontIntegralCF.variable} flex min-h-screen flex-col bg-white font-sans antialiased`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export default Layout
