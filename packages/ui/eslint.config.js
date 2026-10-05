// cspell:ignore bgcolor
import { config } from '@app/config/eslint/react-internal'

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    // Email clients (Outlook) need legacy table attributes such as `bgcolor`.
    files: ['src/emails/**/*.tsx'],
    rules: {
      'react/no-unknown-property': ['warn', { ignore: ['bgcolor'] }],
    },
  },
]
