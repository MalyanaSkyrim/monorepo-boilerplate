'use client'

import { tva } from '@gluestack-ui/utils/nativewind-utils'
import { cssInterop } from 'nativewind'
import React from 'react'
import { I18nManager, Text, View } from 'react-native'
import {
  CodeField,
  useBlurOnFulfill,
  useClearByFocusCell,
} from 'react-native-confirmation-code-field'

cssInterop(Text, { className: 'style' })
cssInterop(View, { className: 'style' })

export const OTP_LENGTH = 6

const otpBoxStyle = tva({
  base: 'h-14 flex-1 items-center justify-center rounded-[10px] border bg-white',
  variants: {
    state: {
      empty: 'border-greyscale-100',
      filled: 'border-greyscale-200',
      active: 'border-primary-300',
      error: 'border-error-100',
    },
  },
  defaultVariants: {
    state: 'empty',
  },
})

const otpDigitStyle = tva({
  base: 'font-inter text-xl font-semibold text-greyscale-900',
})

const otpErrorStyle = tva({
  base: 'font-regular font-inter text-sm text-error-100',
})

export interface OtpInputProps {
  /** The digits entered so far, 0 to OTP_LENGTH characters */
  value: string
  onChangeText: (value: string) => void
  isError?: boolean
  error?: string
}

/**
 * Six-box one-time-code field.
 *
 * Wraps `CodeField`, which stretches a single TextInput over the cells instead
 * of using one input per box — that is what keeps paste, backspace and OS
 * autofill working. Every cell is rendered here, so the boxes stay on our own
 * design tokens.
 */
const OtpInput = ({
  value,
  onChangeText,
  isError = false,
  error,
}: OtpInputProps) => {
  const ref = useBlurOnFulfill({ value, cellCount: OTP_LENGTH })
  const [codeFieldProps, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue: onChangeText,
  })

  const hasError = isError || Boolean(error)

  const handleChangeText = React.useCallback(
    (text: string) => {
      onChangeText(text.replace(/\D/g, '').slice(0, OTP_LENGTH))
    },
    [onChangeText],
  )

  const cellState = (
    symbol: string,
    isFocused: boolean,
  ): 'empty' | 'filled' | 'active' | 'error' => {
    if (hasError) return 'error'
    if (isFocused) return 'active'
    if (symbol.length > 0) return 'filled'
    return 'empty'
  }

  return (
    <View className="flex-col">
      <CodeField
        ref={ref}
        {...codeFieldProps}
        value={value}
        onChangeText={handleChangeText}
        cellCount={OTP_LENGTH}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        // A code always reads left to right, so undo the RTL row flip.
        rootStyle={{
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
          gap: 8,
        }}
        renderCell={({ index, symbol, isFocused }) => (
          <View
            key={index}
            onLayout={getCellOnLayoutHandler(index)}
            className={otpBoxStyle({ state: cellState(symbol, isFocused) })}>
            <Text className={otpDigitStyle({})}>{symbol}</Text>
          </View>
        )}
      />

      {error !== undefined && (
        <View className="mt-2">
          <Text className={otpErrorStyle({})}>{error}</Text>
        </View>
      )}
    </View>
  )
}

OtpInput.displayName = 'OtpInput'

export { OtpInput }
