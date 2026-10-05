'use client'

import { createTextarea } from '@gluestack-ui/core/textarea/creator'
import {
  tva,
  useStyleContext,
  withStyleContext,
} from '@gluestack-ui/utils/nativewind-utils'
import { AlertCircle } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import { BlurEvent, FocusEvent, Text, TextInput, View } from 'react-native'

const SCOPE = 'TEXTAREA'

// Type definitions for context values
interface TextAreaFieldContextValue {
  disabled?: boolean
  isError?: boolean
  isFocused?: boolean
  hasValue?: boolean
  currentLength?: number
  setFocused?: (focused: boolean) => void
  setHasValue?: (hasValue: boolean) => void
  setCurrentLength?: (length: number) => void
}

// Apply cssInterop to base components before using them
cssInterop(TextInput, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(View, { className: 'style' })

const Root = withStyleContext(View, SCOPE)

const UITextarea = createTextarea({
  Root: Root,
  Input: TextInput,
})

const textAreaStyle = tva({
  base: 'flex-col relative gap-2',
  variants: {
    disabled: {
      true: '',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

const textAreaFieldStyle = tva({
  base: 'font-inter bg-white border rounded-[10px]',
  variants: {
    state: {
      default: 'border-greyscale-100 text-greyscale-900',
      focused: 'border-primary-300 text-greyscale-900',
      filled: 'border-greyscale-100 text-greyscale-900',
      disabled: 'bg-greyscale-25 border-greyscale-100 text-greyscale-300',
      error: 'border-error-100 text-greyscale-900',
    },
    disabled: {
      true: 'text-greyscale-300',
      false: 'text-greyscale-900',
    },
  },
  compoundVariants: [
    {
      state: 'disabled',
      disabled: true,
      class: 'bg-greyscale-25 border-greyscale-100 text-greyscale-300',
    },
    {
      state: 'default',
      disabled: true,
      class: 'bg-greyscale-25 text-greyscale-300',
    },
    {
      state: 'filled',
      disabled: true,
      class: 'bg-greyscale-25 text-greyscale-300',
    },
    {
      state: 'focused',
      disabled: true,
      class: 'bg-greyscale-25 border-greyscale-100 text-greyscale-300',
    },
    {
      state: 'error',
      disabled: true,
      class: 'bg-greyscale-25 border-greyscale-100 text-greyscale-300',
    },
  ],
  defaultVariants: {
    state: 'default',
    disabled: false,
  },
})

const textAreaHintStyle = tva({
  base: 'font-regular font-inter text-[14px] text-greyscale-400',
})

const textAreaErrorStyle = tva({
  base: 'font-regular font-inter text-[14px] text-error-100',
})

const textAreaFooterStyle = tva({
  base: 'font-regular font-inter text-[12px] text-greyscale-300',
})

// Internal components (not exported)
type ITextAreaFieldProps = React.ComponentProps<typeof UITextarea.Input> & {
  className?: string
  placeholderTextColor?: string
  maxLength?: number
  value?: string
  defaultValue?: string
  onChangeText?: (text: string) => void
  onTextChange?: (text: string) => void
}

const TextAreaField = React.forwardRef<
  React.ElementRef<typeof UITextarea.Input>,
  ITextAreaFieldProps
>(
  (
    {
      className,
      placeholderTextColor,
      maxLength,
      onFocus,
      onBlur,
      onChangeText,
      onTextChange,
      ...props
    },
    ref,
  ) => {
    const context = useStyleContext(SCOPE) as TextAreaFieldContextValue | null
    const {
      disabled: parentDisabled = false,
      isError: parentIsError = false,
      isFocused: parentIsFocused = false,
      hasValue: parentHasValue = false,
      currentLength: parentCurrentLength = 0,
      setFocused,
      setHasValue,
      setCurrentLength,
    } = context || {}

    const finalDisabled = parentDisabled

    // Determine current state based on context focus/value and parent error state
    const currentState = finalDisabled
      ? 'disabled'
      : parentIsError
        ? 'error'
        : parentIsFocused
          ? 'focused'
          : parentHasValue
            ? 'filled'
            : 'default'

    const handleFocus = (e: FocusEvent) => {
      if (finalDisabled) return
      setFocused?.(true)
      onFocus?.(e)
    }

    const handleBlur = (e: BlurEvent) => {
      if (finalDisabled) return
      setFocused?.(false)
      onBlur?.(e)
    }

    const handleChangeText = (text: string) => {
      if (finalDisabled) return
      const hasText = text.length > 0
      setHasValue?.(hasText)
      setCurrentLength?.(text.length)
      onChangeText?.(text)
      onTextChange?.(text)
    }

    const placeholderColor =
      placeholderTextColor || (finalDisabled ? '#a4acb9' : '#818898')

    const fieldStyle = textAreaFieldStyle({
      state: currentState,
      disabled: finalDisabled,
      class: className,
    })

    const showOutline = parentIsFocused && !finalDisabled
    const borderRadius = 10
    const outlineColor = parentIsError
      ? 'border-error-100'
      : 'border-primary-300'
    const outlineOpacity = parentIsError ? 0.24 : 0.32

    // Filter out conflicting props when disabled
    const filteredProps = finalDisabled
      ? {
          ...props,
          editable: false,
          onChangeText: undefined,
          onFocus: undefined,
          onBlur: undefined,
          onSelectionChange: undefined,
          onContentSizeChange: undefined,
        }
      : props

    return (
      <View className="relative">
        {showOutline && (
          <View
            key="outline"
            className={`${outlineColor} absolute inset-0 border-2`}
            style={{
              opacity: outlineOpacity,
              margin: -3,
              borderRadius: borderRadius + 3,
            }}
          />
        )}
        <View
          className="relative"
          pointerEvents={finalDisabled ? 'none' : 'auto'}>
          <UITextarea.Input
            ref={ref}
            {...filteredProps}
            multiline
            textAlignVertical="top"
            editable={!finalDisabled}
            maxLength={maxLength}
            onFocus={finalDisabled ? undefined : handleFocus}
            onBlur={finalDisabled ? undefined : handleBlur}
            onChangeText={finalDisabled ? undefined : handleChangeText}
            placeholderTextColor={placeholderColor}
            className={fieldStyle}
            style={{
              paddingTop: 10,
              paddingRight: 12,
              paddingBottom: 10,
              paddingLeft: 12,
              height: 120,
              fontSize: 16,
              lineHeight: 16 * 1.6, // 160% line height
            }}
          />
          {maxLength !== undefined && (
            <View
              className="absolute"
              style={{
                bottom: 10, // Match paddingBottom
                left: 12, // Match paddingLeft
              }}
              pointerEvents="none">
              <TextAreaFooter
                currentLength={parentCurrentLength}
                maxLength={maxLength}
              />
            </View>
          )}
        </View>
      </View>
    )
  },
)

const TextAreaHint = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text> & {
    className?: string
  }
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      {...props}
      className={textAreaHintStyle({ class: className })}
    />
  )
})

const TextAreaError = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentPropsWithoutRef<typeof View> & {
    className?: string
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  return (
    <View
      ref={ref}
      {...props}
      className={`flex-row items-center gap-1 ${className || ''}`}>
      <AlertCircle size={16} color="#df1c41" />
      <Text className={textAreaErrorStyle({ class: className })}>
        {children}
      </Text>
    </View>
  )
})

const TextAreaFooter = React.forwardRef<
  React.ElementRef<typeof Text>,
  React.ComponentPropsWithoutRef<typeof Text> & {
    className?: string
    currentLength: number
    maxLength?: number
  }
>(({ className, currentLength, maxLength, ...props }, ref) => {
  if (maxLength === undefined) return null

  return (
    <Text
      ref={ref}
      {...props}
      className={textAreaFooterStyle({ class: className })}>
      {currentLength}/{maxLength}
    </Text>
  )
})

// Public API
type ITextAreaProps = Omit<
  React.ComponentProps<typeof UITextarea>,
  'context'
> & {
  className?: string
  isError?: boolean
  disabled?: boolean
  maxLength?: number
  value?: string
  defaultValue?: string
  placeholder?: string
  placeholderTextColor?: string
  onChangeText?: (text: string) => void
  hint?: string
  error?: string
}

const TextArea = React.forwardRef<
  React.ElementRef<typeof UITextarea>,
  ITextAreaProps
>(
  (
    {
      className,
      isError = false,
      disabled = false,
      maxLength,
      value,
      defaultValue,
      placeholder,
      placeholderTextColor,
      onChangeText,
      hint,
      error,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(
      Boolean(value || defaultValue),
    )
    const [currentLength, setCurrentLength] = React.useState(
      value?.length || defaultValue?.length || 0,
    )

    // Sync hasValue and currentLength with value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setHasValue(Boolean(value))
        setCurrentLength(value.length)
      } else if (defaultValue !== undefined) {
        setHasValue(Boolean(defaultValue))
        setCurrentLength(defaultValue.length)
      }
    }, [value, defaultValue])

    const contextValue = React.useMemo(
      () => ({
        disabled,
        isError,
        isFocused,
        hasValue,
        currentLength,
        setFocused: setIsFocused,
        setHasValue,
        setCurrentLength,
      }),
      [disabled, isError, isFocused, hasValue, currentLength],
    )

    return (
      <UITextarea
        ref={ref}
        {...props}
        className={textAreaStyle({
          disabled,
          class: className,
        })}
        context={contextValue}>
        <TextAreaField
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          maxLength={maxLength}
          onChangeText={onChangeText}
          onTextChange={(text) => setCurrentLength(text.length)}
        />
        {hint && !error && <TextAreaHint>{hint}</TextAreaHint>}
        {error && <TextAreaError>{error}</TextAreaError>}
      </UITextarea>
    )
  },
)

TextArea.displayName = 'TextArea'
TextAreaField.displayName = 'TextAreaField'
TextAreaHint.displayName = 'TextAreaHint'
TextAreaError.displayName = 'TextAreaError'
TextAreaFooter.displayName = 'TextAreaFooter'

export { TextArea }
