'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  type TextStyle,
  type ViewStyle,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type { ICountryCca2 } from 'react-native-country-select'
import RNPhoneInput, {
  type ICountry,
  getAllCountries,
  getCountryByCca2,
} from 'react-native-international-phone-number'

const BORDER_DEFAULT = '#dfe1e7'
const BORDER_FOCUS = '#656bfa'
const BORDER_ERROR = '#dc2626'
const TEXT_COLOR = '#0d0d12'
const PLACEHOLDER = '#818898'
const DISABLED_TEXT = '#a4acb9'
const DISABLED_BG = '#f6f8fa'
const HINT = '#818898'
const ERROR = '#dc2626'

const DEFAULT_COUNTRY_CCA2: ICountryCca2 = 'US'

export interface PhoneInputProps {
  /** E.164 value (controlled) */
  value?: string
  /** E.164 initial value (uncontrolled) */
  defaultValue?: string
  /** Called with E.164 format (e.g., "+12345678900") or ''. No validation performed - just string concatenation. */
  onChange?: (e164: string) => void
  onBlur?: () => void
  /** cca2, e.g. 'US'. Default 'US'. */
  defaultCountry?: ICountryCca2
  placeholder?: string
  disabled?: boolean
  error?: string
  isError?: boolean
  hint?: string
  /** Default 'lg'. lg: h-12 (48px), sm: h-10 (40px). */
  size?: 'sm' | 'lg'
}

function getHeight(size: 'sm' | 'lg'): number {
  switch (size) {
    case 'sm':
      return 40
    case 'lg':
      return 48
    default:
      return 48
  }
}

function getBorderRadius(size: 'sm' | 'lg'): number {
  switch (size) {
    case 'sm':
      return 8
    case 'lg':
      return 10
    default:
      return 10
  }
}

/**
 * Derive country and national number from stored value (e.g. "+1234567890").
 * No validation - only strips the country calling code prefix to get national digits.
 */
function valueToState(
  value: string,
  defaultCca2: ICountryCca2,
): { country: ICountry | null; national: string } {
  const defaultCountry = getCountryByCca2(defaultCca2) ?? null
  if (!value || value.trim() === '') {
    return { country: defaultCountry, national: '' }
  }
  const trimmed = value.trim()
  if (!trimmed.startsWith('+')) {
    return { country: defaultCountry, national: trimmed }
  }

  const countries = getAllCountries()
  const sortedCountries = [...countries].sort((a, b) => {
    const aCode = a.idd?.root ?? ''
    const bCode = b.idd?.root ?? ''
    return bCode.length - aCode.length
  })

  for (const c of sortedCountries) {
    const prefix = c.idd?.root ?? ''
    if (prefix && trimmed.startsWith(prefix)) {
      const national = trimmed.slice(prefix.length).replace(/\D/g, '')
      return { country: c, national }
    }
  }

  const digitsOnly = trimmed.slice(1).replace(/\D/g, '')
  return { country: defaultCountry, national: digitsOnly }
}

const PhoneInput = ({
  value: valueProp,
  defaultValue,
  onChange,
  onBlur,
  defaultCountry = DEFAULT_COUNTRY_CCA2,
  placeholder,
  disabled = false,
  error,
  isError = false,
  hint,
  size = 'lg',
}: PhoneInputProps) => {
  const isControlled = valueProp !== undefined
  const defaultCca2 = defaultCountry ?? DEFAULT_COUNTRY_CCA2

  const [isFocused, setIsFocused] = useState(false)
  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])
  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(
    () => {
      const initial = isControlled ? valueProp : defaultValue
      const { country } = valueToState(initial ?? '', defaultCca2)
      return country
    },
  )
  const [inputValue, setInputValue] = useState<string>(() => {
    const initial = isControlled ? valueProp : defaultValue
    const { national } = valueToState(initial ?? '', defaultCca2)
    return national
  })

  const effectiveValue = isControlled ? valueProp : undefined
  const lastEmittedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isControlled) return
    const v = effectiveValue ?? ''
    if (v === lastEmittedRef.current) return
    lastEmittedRef.current = null
    const { country, national } = valueToState(v, defaultCca2)
    setSelectedCountry(country)
    setInputValue(national)
  }, [isControlled, effectiveValue, defaultCca2])

  const emitE164 = useCallback(
    (national: string, country: ICountry | null) => {
      if (!onChange) return

      if (!national.trim()) {
        lastEmittedRef.current = ''
        onChange('')
        return
      }

      const callingCode = country?.idd?.root ?? ''
      const international = `${callingCode}${national.replace(/\D/g, '')}`
      lastEmittedRef.current = international
      onChange(international)
    },
    [onChange],
  )

  const handleChangePhoneNumber = useCallback(
    (national: string) => {
      setInputValue(national)
      emitE164(national, selectedCountry)
    },
    [selectedCountry, emitE164],
  )

  const handleChangeSelectedCountry = useCallback(
    (country: ICountry) => {
      setSelectedCountry(country)
      setInputValue('')
      onChange?.('')
    },
    [onChange],
  )

  const hasError = isError || Boolean(error)
  const height = getHeight(size)
  const borderRadius = getBorderRadius(size)

  const phoneInputStyles = useMemo(() => {
    const borderColor = isFocused
      ? BORDER_FOCUS
      : hasError
        ? BORDER_ERROR
        : BORDER_DEFAULT
    const container: ViewStyle = {
      height,
      borderRadius,
      borderWidth: 1,
      borderColor,
      backgroundColor: disabled ? DISABLED_BG : '#ffffff',
      paddingLeft: 0,
      paddingRight: 12,
    }
    const flagContainer: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      paddingRight: 8,
    }
    const divider: ViewStyle = {
      width: 1,
      height: '60%',
      backgroundColor: BORDER_DEFAULT,
      marginRight: 0,
    }
    const callingCode: TextStyle = {
      fontSize: 16,
      color: disabled ? DISABLED_TEXT : TEXT_COLOR,
      // marginRight: 0,
    }
    const input: TextStyle & { keyboardType?: 'phone-pad' } = {
      flex: 1,
      fontSize: 16,
      color: disabled ? DISABLED_TEXT : TEXT_COLOR,
      paddingVertical: 8,
      paddingHorizontal: 0,
      keyboardType: 'phone-pad',
    }
    return {
      container,
      flagContainer,
      divider,
      callingCode,
      input,
    }
  }, [height, borderRadius, hasError, disabled, isFocused])

  const modalStyles = useMemo(() => {
    return {
      countryItem: {
        borderWidth: 0,
      },
      searchInput: {
        borderWidth: 0.5,
        borderColor: '#dfe1e7',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 12,
      },
    }
  }, [])

  const showOutline = isFocused && !disabled

  return (
    <View>
      <View>
        <View
          key="outline"
          className="absolute border-2"
          style={{
            top: -3,
            left: -3,
            right: -3,
            bottom: -3,
            opacity: showOutline ? (isError ? 0.24 : 0.2) : 0,
            borderRadius: borderRadius + 3,
            borderColor: isError ? '#dc2626' : '#8B8FFC',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <RNPhoneInput
          value={inputValue}
          onChangePhoneNumber={handleChangePhoneNumber}
          selectedCountry={selectedCountry}
          onChangeSelectedCountry={handleChangeSelectedCountry}
          defaultCountry={defaultCca2}
          placeholder={placeholder}
          disabled={disabled}
          phoneInputStyles={phoneInputStyles}
          phoneInputPlaceholderTextColor={PLACEHOLDER}
          phoneInputSelectionColor={BORDER_FOCUS}
          modalStyles={modalStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </View>
      {(error || hint) && (
        <View style={styles.messageContainer}>
          {error ? (
            <Text style={[styles.message, styles.error]}>{error}</Text>
          ) : (
            hint && <Text style={[styles.message, styles.hint]}>{hint}</Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  messageContainer: {
    marginTop: 8,
  },
  message: {
    fontSize: 14,
  },
  hint: {
    color: HINT,
  },
  error: {
    color: ERROR,
  },
})

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
