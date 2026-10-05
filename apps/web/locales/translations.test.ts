import { compareTranslationKeys, type TranslationObject } from '@app/common'
import { describe, it, expect } from 'vitest'

import enJson from './en.json'
import frJson from './fr.json'

const en = enJson as TranslationObject
const fr = frJson as TranslationObject

describe('Web Translation Consistency', () => {
  it('should have the same keys in English and French', () => {
    const { missingInTarget, missingInReference } = compareTranslationKeys(
      en,
      fr,
    )

    expect(
      missingInTarget,
      'Keys existing in English but missing in French (fr.json)',
    ).toEqual([])
    expect(
      missingInReference,
      'Keys existing in French but missing in English (en.json)',
    ).toEqual([])
  })
})
