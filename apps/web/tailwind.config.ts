// apps/web/tailwind.config.ts
import uiConfig from '@app/ui/tailwind.config'
import type { Config } from 'tailwindcss'

/**
 * The marketing site adds its own type/spacing scale on top of the shared
 * design system. The numbers come from the App Boilerplate design system: one grotesk
 * at weights 500 and 700, a 4px base scale, 16px card radius and 12px controls.
 */
const config: Config = {
  ...uiConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    '../../packages/ui/src/components/**/*.{ts,tsx}',
  ],
  theme: {
    ...uiConfig.theme,
    extend: {
      ...uiConfig.theme?.extend,
      // The type scale deliberately lives in `app/marketing.css` instead of
      // here — see the note in that file about tailwind-merge dropping
      // custom `text-*` tokens.
      borderRadius: {
        card: '16px',
        btn: '12px',
        input: '12px',
      },
      spacing: {
        section: '64px',
        'section-lg': '120px',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
}
export default config
