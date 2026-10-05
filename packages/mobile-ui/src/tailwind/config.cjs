/* eslint-disable @typescript-eslint/no-require-imports, no-undef */
/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  darkMode: 'class',
  content: [
    // Apps should extend this with their own content paths
  ],
  presets: [require('nativewind/preset')],
  important: 'html',
  safelist: [
    {
      pattern:
        /(bg|border|text|stroke|fill)-(primary|secondary|tertiary|error|success|warning|info|typography|outline|background|indicator|greyscale|sky)-(0|25|50|100|200|300|400|500|600|700|800|900|950|white|gray|black|error|warning|muted|success|info|light|dark|primary)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          0: 'rgb(var(--color-primary-0)/<alpha-value>)',
          25: 'rgb(var(--color-primary-25)/<alpha-value>)',
          50: 'rgb(var(--color-primary-50)/<alpha-value>)',
          100: 'rgb(var(--color-primary-100)/<alpha-value>)',
          200: 'rgb(var(--color-primary-200)/<alpha-value>)',
          300: 'rgb(var(--color-primary-300)/<alpha-value>)',
        },
        secondary: {
          0: 'rgb(var(--color-secondary-0)/<alpha-value>)',
          50: 'rgb(var(--color-secondary-50)/<alpha-value>)',
          100: 'rgb(var(--color-secondary-100)/<alpha-value>)',
          200: 'rgb(var(--color-secondary-200)/<alpha-value>)',
          300: 'rgb(var(--color-secondary-300)/<alpha-value>)',
          400: 'rgb(var(--color-secondary-400)/<alpha-value>)',
          500: 'rgb(var(--color-secondary-500)/<alpha-value>)',
          600: 'rgb(var(--color-secondary-600)/<alpha-value>)',
          700: 'rgb(var(--color-secondary-700)/<alpha-value>)',
          800: 'rgb(var(--color-secondary-800)/<alpha-value>)',
          900: 'rgb(var(--color-secondary-900)/<alpha-value>)',
          950: 'rgb(var(--color-secondary-950)/<alpha-value>)',
        },
        tertiary: {
          50: 'rgb(var(--color-tertiary-50)/<alpha-value>)',
          100: 'rgb(var(--color-tertiary-100)/<alpha-value>)',
          200: 'rgb(var(--color-tertiary-200)/<alpha-value>)',
          300: 'rgb(var(--color-tertiary-300)/<alpha-value>)',
          400: 'rgb(var(--color-tertiary-400)/<alpha-value>)',
          500: 'rgb(var(--color-tertiary-500)/<alpha-value>)',
          600: 'rgb(var(--color-tertiary-600)/<alpha-value>)',
          700: 'rgb(var(--color-tertiary-700)/<alpha-value>)',
          800: 'rgb(var(--color-tertiary-800)/<alpha-value>)',
          900: 'rgb(var(--color-tertiary-900)/<alpha-value>)',
          950: 'rgb(var(--color-tertiary-950)/<alpha-value>)',
        },
        error: {
          0: 'rgb(var(--color-error-0)/<alpha-value>)',
          25: 'rgb(var(--color-error-25)/<alpha-value>)',
          50: 'rgb(var(--color-error-50)/<alpha-value>)',
          100: 'rgb(var(--color-error-100)/<alpha-value>)',
          200: 'rgb(var(--color-error-200)/<alpha-value>)',
          300: 'rgb(var(--color-error-300)/<alpha-value>)',
        },
        success: {
          0: 'rgb(var(--color-success-0)/<alpha-value>)',
          25: 'rgb(var(--color-success-25)/<alpha-value>)',
          50: 'rgb(var(--color-success-50)/<alpha-value>)',
          100: 'rgb(var(--color-success-100)/<alpha-value>)',
          200: 'rgb(var(--color-success-200)/<alpha-value>)',
          300: 'rgb(var(--color-success-300)/<alpha-value>)',
        },
        warning: {
          0: 'rgb(var(--color-warning-0)/<alpha-value>)',
          25: 'rgb(var(--color-warning-25)/<alpha-value>)',
          50: 'rgb(var(--color-warning-50)/<alpha-value>)',
          100: 'rgb(var(--color-warning-100)/<alpha-value>)',
          200: 'rgb(var(--color-warning-200)/<alpha-value>)',
          300: 'rgb(var(--color-warning-300)/<alpha-value>)',
        },
        info: {
          0: 'rgb(var(--color-info-0)/<alpha-value>)',
          50: 'rgb(var(--color-info-50)/<alpha-value>)',
          100: 'rgb(var(--color-info-100)/<alpha-value>)',
          200: 'rgb(var(--color-info-200)/<alpha-value>)',
          300: 'rgb(var(--color-info-300)/<alpha-value>)',
          400: 'rgb(var(--color-info-400)/<alpha-value>)',
          500: 'rgb(var(--color-info-500)/<alpha-value>)',
          600: 'rgb(var(--color-info-600)/<alpha-value>)',
          700: 'rgb(var(--color-info-700)/<alpha-value>)',
          800: 'rgb(var(--color-info-800)/<alpha-value>)',
          900: 'rgb(var(--color-info-900)/<alpha-value>)',
          950: 'rgb(var(--color-info-950)/<alpha-value>)',
        },
        typography: {
          0: 'rgb(var(--color-typography-0)/<alpha-value>)',
          50: 'rgb(var(--color-typography-50)/<alpha-value>)',
          100: 'rgb(var(--color-typography-100)/<alpha-value>)',
          200: 'rgb(var(--color-typography-200)/<alpha-value>)',
          300: 'rgb(var(--color-typography-300)/<alpha-value>)',
          400: 'rgb(var(--color-typography-400)/<alpha-value>)',
          500: 'rgb(var(--color-typography-500)/<alpha-value>)',
          600: 'rgb(var(--color-typography-600)/<alpha-value>)',
          700: 'rgb(var(--color-typography-700)/<alpha-value>)',
          800: 'rgb(var(--color-typography-800)/<alpha-value>)',
          900: 'rgb(var(--color-typography-900)/<alpha-value>)',
          950: 'rgb(var(--color-typography-950)/<alpha-value>)',
          white: '#FFFFFF',
          gray: '#D4D4D4',
          black: '#181718',
        },
        outline: {
          0: 'rgb(var(--color-outline-0)/<alpha-value>)',
          50: 'rgb(var(--color-outline-50)/<alpha-value>)',
          100: 'rgb(var(--color-outline-100)/<alpha-value>)',
          200: 'rgb(var(--color-outline-200)/<alpha-value>)',
          300: 'rgb(var(--color-outline-300)/<alpha-value>)',
          400: 'rgb(var(--color-outline-400)/<alpha-value>)',
          500: 'rgb(var(--color-outline-500)/<alpha-value>)',
          600: 'rgb(var(--color-outline-600)/<alpha-value>)',
          700: 'rgb(var(--color-outline-700)/<alpha-value>)',
          800: 'rgb(var(--color-outline-800)/<alpha-value>)',
          900: 'rgb(var(--color-outline-900)/<alpha-value>)',
          950: 'rgb(var(--color-outline-950)/<alpha-value>)',
        },
        background: {
          0: 'rgb(var(--color-background-0)/<alpha-value>)',
          50: 'rgb(var(--color-background-50)/<alpha-value>)',
          100: 'rgb(var(--color-background-100)/<alpha-value>)',
          200: 'rgb(var(--color-background-200)/<alpha-value>)',
          300: 'rgb(var(--color-background-300)/<alpha-value>)',
          400: 'rgb(var(--color-background-400)/<alpha-value>)',
          500: 'rgb(var(--color-background-500)/<alpha-value>)',
          600: 'rgb(var(--color-background-600)/<alpha-value>)',
          700: 'rgb(var(--color-background-700)/<alpha-value>)',
          800: 'rgb(var(--color-background-800)/<alpha-value>)',
          900: 'rgb(var(--color-background-900)/<alpha-value>)',
          950: 'rgb(var(--color-background-950)/<alpha-value>)',
          error: 'rgb(var(--color-background-error)/<alpha-value>)',
          warning: 'rgb(var(--color-background-warning)/<alpha-value>)',
          muted: 'rgb(var(--color-background-muted)/<alpha-value>)',
          success: 'rgb(var(--color-background-success)/<alpha-value>)',
          info: 'rgb(var(--color-background-info)/<alpha-value>)',
          light: '#FBFBFB',
          dark: '#181719',
        },
        indicator: {
          primary: 'rgb(var(--color-indicator-primary)/<alpha-value>)',
          info: 'rgb(var(--color-indicator-info)/<alpha-value>)',
          error: 'rgb(var(--color-indicator-error)/<alpha-value>)',
        },
        greyscale: {
          0: 'rgb(var(--color-greyscale-0)/<alpha-value>)',
          25: 'rgb(var(--color-greyscale-25)/<alpha-value>)',
          50: 'rgb(var(--color-greyscale-50)/<alpha-value>)',
          100: 'rgb(var(--color-greyscale-100)/<alpha-value>)',
          200: 'rgb(var(--color-greyscale-200)/<alpha-value>)',
          300: 'rgb(var(--color-greyscale-300)/<alpha-value>)',
          400: 'rgb(var(--color-greyscale-400)/<alpha-value>)',
          500: 'rgb(var(--color-greyscale-500)/<alpha-value>)',
          600: 'rgb(var(--color-greyscale-600)/<alpha-value>)',
          700: 'rgb(var(--color-greyscale-700)/<alpha-value>)',
          800: 'rgb(var(--color-greyscale-800)/<alpha-value>)',
          900: 'rgb(var(--color-greyscale-900)/<alpha-value>)',
        },
        sky: {
          0: 'rgb(var(--color-sky-0)/<alpha-value>)',
          25: 'rgb(var(--color-sky-25)/<alpha-value>)',
          100: 'rgb(var(--color-sky-100)/<alpha-value>)',
          200: 'rgb(var(--color-sky-200)/<alpha-value>)',
          300: 'rgb(var(--color-sky-300)/<alpha-value>)',
        },
      },
      fontFamily: {
        jakarta: ['var(--font-plus-jakarta-sans)'],
        roboto: ['var(--font-roboto)'],
        code: ['var(--font-source-code-pro)'],
        inter: ['var(--font-inter)'],
        'space-mono': ['var(--font-space-mono)'],
      },
      fontWeight: {
        extrablack: '950',
      },
      fontSize: {
        '2xs': '10px',
        // Heading sizes
        h1: ['48px', { lineHeight: '57.6px', letterSpacing: '0' }],
        h2: ['40px', { lineHeight: '48px', letterSpacing: '0' }],
        h3: ['32px', { lineHeight: '44.8px', letterSpacing: '0' }],
        h4: ['24px', { lineHeight: '36px', letterSpacing: '0' }],
        h5: ['20px', { lineHeight: '28px', letterSpacing: '0' }],
        h6: ['18px', { lineHeight: '25.2px', letterSpacing: '0' }],
        // Body sizes
        'body-large': ['18px', { lineHeight: '27.9px', letterSpacing: '0' }],
        'body-medium': [
          '16px',
          { lineHeight: '25.6px', letterSpacing: '-0.32px' },
        ],
        'body-small': [
          '14px',
          { lineHeight: '21.7px', letterSpacing: '-0.28px' },
        ],
        'body-xsmall': [
          '12px',
          { lineHeight: '18.6px', letterSpacing: '-0.24px' },
        ],
      },
      boxShadow: {
        'hard-1': '-2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-2': '0px 3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-3': '2px 2px 8px 0px rgba(38, 38, 38, 0.20)',
        'hard-4': '0px -3px 10px 0px rgba(38, 38, 38, 0.20)',
        'hard-5': '0px 2px 10px 0px rgba(38, 38, 38, 0.10)',
        'soft-1': '0px 0px 10px rgba(38, 38, 38, 0.1)',
        'soft-2': '0px 0px 20px rgba(38, 38, 38, 0.2)',
        'soft-3': '0px 0px 30px rgba(38, 38, 38, 0.1)',
        'soft-4': '0px 0px 40px rgba(38, 38, 38, 0.1)',
        // Shadow tokens from Figma
        'shadow-xsmall': '0px 1px 2px 0px rgba(13, 13, 18, 0.06)',
        'shadow-small':
          '0px 1px 2px 0px rgba(13, 13, 18, 0.06), 0px 1px 3px 0px rgba(13, 13, 18, 0.05)',
        'shadow-medium':
          '0px 4px 8px -1px rgba(13, 13, 18, 0.02), 0px 5px 10px -2px rgba(13, 13, 18, 0.04)',
        'shadow-large':
          '0px 4px 6px -2px rgba(13, 13, 18, 0.03), 0px 12px 16px -4px rgba(13, 13, 18, 0.05)',
        'shadow-xlarge': '0px 24px 48px -12px rgba(13, 13, 18, 0.12)',
        'shadow-xxlarge': '0px 24px 48px -12px rgba(13, 13, 18, 0.18)',
        // Button shadows
        'button-primary-normal':
          '0px 0px 0px 1px rgba(79, 71, 235, 1), 0px 1px 2px 0px rgba(26, 19, 161, 0.5)',
        'button-primary-active':
          '0px 0px 0px 3px rgba(95, 87, 255, 0.5), 0px 0px 0px 2px rgba(255, 255, 255, 1), 0px 0px 0px 1px rgba(79, 71, 235, 1), 0px 1px 2px 0px rgba(26, 19, 161, 0.5)',
        'button-secondary-normal':
          '0px 0px 0px 1px rgba(18, 55, 105, 0.08), 0px 1px 2px 0px rgba(164, 172, 185, 0.24)',
        'button-secondary-active':
          '0px 0px 0px 3px rgba(95, 87, 255, 0.5), 0px 0px 0px 2px rgba(255, 255, 255, 1), 0px 0px 0px 1px rgba(18, 55, 105, 0.08), 0px 1px 2px 0px rgba(164, 172, 185, 0.4)',
        'button-destructive-normal':
          '0px 0px 0px 1px rgba(183, 24, 54, 1), 0px 1px 2px 0px rgba(113, 14, 33, 0.5)',
        'button-destructive-active':
          '0px 0px 0px 3px rgba(95, 87, 255, 0.5), 0px 0px 0px 2px rgba(255, 255, 255, 1), 0px 0px 0px 1px rgba(183, 24, 54, 1), 0px 1px 2px 0px rgba(113, 14, 33, 0.5)',
        'button-ghost-active':
          '0px 0px 0px 3px rgba(95, 87, 255, 0.5), 0px 0px 0px 2px rgba(255, 255, 255, 1)',
        // Input shadows
        'input-normal':
          '0px 0px 0px 1px rgba(9, 25, 72, 0.13), 0px 1px 2px 0px rgba(18, 55, 105, 0.08)',
        'input-hover':
          '0px 0px 0px 1px rgba(9, 25, 72, 0.16), 0px 1px 2px 0px rgba(9, 25, 72, 0.16)',
        'input-focus':
          '0px 0px 0px 3px rgba(95, 87, 255, 0.32), 0px 0px 0px 2px rgba(255, 255, 255, 1), 0px 0px 0px 1px rgba(95, 87, 255, 1), 0px 1px 2px 0px rgba(50, 44, 160, 0.4)',
        'input-error':
          '0px 0px 0px 3px rgba(223, 28, 65, 0.24), 0px 0px 0px 2px rgba(255, 255, 255, 1), 0px 0px 0px 1px rgba(223, 28, 65, 1), 0px 1px 2px 0px rgba(150, 19, 44, 0.32)',
        // Checkbox & Radio shadows
        'checkbox-normal':
          '0px 0px 0px 1px rgba(223, 225, 231, 1), 0px 1px 2px 0px rgba(164, 172, 185, 0.4)',
        'checkbox-hover':
          '0px 0px 0px 1px rgba(193, 199, 208, 1), 0px 1px 2px 0px rgba(102, 109, 128, 0.4)',
        // Notification & Toast shadows
        'notification-default':
          '0px 0px 0px 1px rgba(18, 55, 105, 0.08), 0px 1px 2px 0px rgba(164, 172, 185, 0.16), 0px 12px 24px -12px rgba(54, 57, 74, 0.24)',
        'notification-error':
          '0px 0px 0px 1px rgba(223, 28, 65, 0.16), 0px 1px 2px 0px rgba(150, 19, 44, 0.12), 0px 12px 24px -12px rgba(150, 19, 44, 0.24)',
        'notification-warning':
          '0px 0px 0px 1px rgba(155, 118, 39, 0.2), 0px 1px 2px 0px rgba(155, 109, 39, 0.12), 0px 12px 24px -12px rgba(96, 65, 32, 0.24)',
        'notification-info':
          '0px 0px 0px 1px rgba(126, 67, 255, 0.2), 0px 1px 2px 0px rgba(126, 67, 255, 0.12), 0px 12px 24px -12px rgba(54, 29, 109, 0.24)',
        'notification-success':
          '0px 0px 0px 1px rgba(64, 196, 170, 0.28), 0px 1px 2px 0px rgba(64, 196, 170, 0.16), 0px 12px 24px -12px rgba(24, 78, 68, 0.24)',
      },
    },
  },
}

module.exports = tailwindConfig
