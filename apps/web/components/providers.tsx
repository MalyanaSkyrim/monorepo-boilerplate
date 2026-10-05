'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import * as React from 'react'

/**
 * Deliberately thin.
 *
 * Every provider mounted here lands in the first load of the landing page,
 * so the site carries only what it uses. Add toast, tooltip or query-state
 * providers here when a feature needs them.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      forcedTheme="light"
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableColorScheme>
      {children}
    </NextThemesProvider>
  )
}
