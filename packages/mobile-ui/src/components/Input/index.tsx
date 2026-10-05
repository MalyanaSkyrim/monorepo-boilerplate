'use client'

import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator'
import { createInput } from '@gluestack-ui/core/input/creator'
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils'
import { Eye, EyeClosed } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import { I18nManager, Pressable, Text, TextInput, View } from 'react-native'

const SCOPE = 'INPUT'

interface InputFieldContextValue {
  size?: 'sm' | 'lg'
  disabled?: boolean
  isError?: boolean
  state?: 'default' | 'focused' | 'filled' | 'disabled' | 'error'
  isFocused?: boolean
  hasValue?: boolean
  setFocused?: (focused: boolean) => void
  setHasValue?: (hasValue: boolean) => void
  leftIcon?: React.ElementType
  rightIcon?: React.ElementType
  showPassword?: boolean
  setShowPassword?: (show: boolean) => void
  enablePasswordToggle?: boolean
}

// Apply cssInterop to base components before using them
cssInterop(TextInput, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(View, { className: 'style' })

const Root = withStyleContext(View, SCOPE)

const UIInput = createInput({
  Root: Root,
  Icon: UIIcon,
  Slot: Pressable,
  Input: TextInput,
})

cssInterop(PrimitiveIcon, {
  className: {
    target: 'style',
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: 'classNameColor',
      stroke: true,
    },
  },
})

const inputFieldStyle = tva({
  base: 'font-inter bg-white border border-greyscale-100 text-greyscale-900 ',
  variants: {
    size: {
      lg: 'h-12 rounded-[10px] px-3 text-base',
      sm: 'h-10 rounded-lg px-3 text-base',
    },
    disabled: {
      true: 'bg-greyscale-25 border-greyscale-100 text-greyscale-300',
      false: '',
    },
    hasLeftIcon: {
      true: 'pl-11',
      false: '',
    },
    hasRightIcon: {
      true: 'pr-11',
      false: '',
    },
    isError: {
      true: 'border-error-100',
      false: '',
    },
  },
  defaultVariants: {
    size: 'lg',
    disabled: false,
    hasLeftIcon: false,
    hasRightIcon: false,
    isError: false,
  },
})

const inputIconStyle = tva({
  base: 'fill-current text-red-500',
  parentVariants: {
    size: {
      lg: 'h-6 w-6',
      sm: 'h-5 w-5',
    },
    disabled: {
      true: 'stroke-greyscale-300 text-gray-300',
      false: 'stroke-greyscale-400 text-gray-400',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

const inputHintStyle = tva({
  base: 'font-regular font-inter text-sm text-greyscale-400',
})

const inputErrorStyle = tva({
  base: 'font-regular font-inter text-sm text-error-100',
})

type IInputProps = Omit<
  React.ComponentProps<typeof UIInput>,
  'context' | 'children'
> &
  Partial<React.ComponentProps<typeof TextInput>> & {
    className?: string
    inputClassName?: string
    strokeIconColor?: string
    size?: 'sm' | 'lg'
    isError?: boolean
    disabled?: boolean
    hideOutline?: boolean
    leftIcon?: React.ElementType
    rightIcon?: React.ElementType
    enablePasswordToggle?: boolean
    placeholder?: string
    hint?: string
    error?: string
    value?: string
    defaultValue?: string
    onChangeText?: (text: string) => void
    children?: React.ReactNode
  }

const Input = React.forwardRef<React.ElementRef<typeof UIInput>, IInputProps>(
  (
    {
      className,
      inputClassName,
      hideOutline,
      size = 'lg',
      disabled = false,
      isError = false,
      leftIcon,
      rightIcon,
      enablePasswordToggle = false,
      placeholder,
      hint,
      error,
      value,
      defaultValue,
      onChangeText,
      children,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(
      Boolean(value !== undefined ? value : defaultValue),
    )
    const [showPassword, setShowPassword] = React.useState(false)

    React.useEffect(() => {
      if (value !== undefined) {
        setHasValue(Boolean(value))
      }
    }, [value])

    React.useEffect(() => {
      if (props.secureTextEntry !== undefined) {
        setShowPassword(!props.secureTextEntry)
      }
    }, [props.secureTextEntry])

    const handleChangeText = React.useCallback(
      (text: string) => {
        setHasValue(Boolean(text))
        onChangeText?.(text)
      },
      [onChangeText],
    )

    const finalDisabled = disabled
    const finalIsError = isError || Boolean(error)

    const contextValue = React.useMemo(
      () => ({
        size,
        disabled: finalDisabled,
        isError: finalIsError,
        isFocused,
        hasValue,
        setFocused: setIsFocused,
        setHasValue,
        leftIcon,
        rightIcon,
        showPassword,
        setShowPassword,
        enablePasswordToggle,
      }),
      [
        size,
        finalDisabled,
        finalIsError,
        isFocused,
        hasValue,
        leftIcon,
        rightIcon,
        showPassword,
        setShowPassword,
        enablePasswordToggle,
      ],
    )

    if (children) {
      return (
        <UIInput
          ref={ref}
          className={`relative flex-col ${className || ''}`}
          context={contextValue}>
          {children}
        </UIInput>
      )
    }

    return (
      <UIInput
        ref={ref}
        className={`relative flex-col ${className || ''}`}
        context={contextValue}>
        <InputFieldInternal
          placeholder={placeholder}
          className={inputClassName}
          value={value}
          defaultValue={defaultValue}
          onChangeText={handleChangeText}
          hideOutline={hideOutline}
          {...props}
        />
        {(error || hint) && (
          <View className="mt-2">
            {error && <InputErrorInternal>{error}</InputErrorInternal>}
            {!error && hint && <InputHintInternal>{hint}</InputHintInternal>}
          </View>
        )}
      </UIInput>
    )
  },
)

type IInputFieldProps = React.ComponentProps<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle> & {
    className?: string
    hideOutline?: boolean
    strokeIconColor?: string
  } & Partial<
    Pick<
      React.ComponentProps<typeof TextInput>,
      | 'keyboardType'
      | 'secureTextEntry'
      | 'autoCapitalize'
      | 'autoCorrect'
      | 'autoComplete'
      | 'returnKeyType'
      | 'onSubmitEditing'
      | 'blurOnSubmit'
      | 'multiline'
      | 'numberOfLines'
      | 'maxLength'
      | 'editable'
      | 'selectTextOnFocus'
      | 'textAlign'
      | 'textAlignVertical'
      | 'selectionColor'
      | 'clearTextOnFocus'
      | 'spellCheck'
      | 'autoFocus'
      | 'onKeyPress'
      | 'onScroll'
      | 'onSelectionChange'
      | 'onContentSizeChange'
      | 'onEndEditing'
      | 'onFocus'
      | 'onBlur'
      | 'onChange'
      | 'onLayout'
    >
  >

const InputFieldInternal = React.forwardRef<
  React.ComponentRef<typeof UIInput.Input>,
  IInputFieldProps
>(
  (
    {
      className,
      strokeIconColor,
      hideOutline,
      size,
      disabled,
      placeholderTextColor,
      onFocus,
      onBlur,
      onChangeText,
      ...props
    },
    ref,
  ) => {
    const context = useStyleContext(SCOPE) as InputFieldContextValue | null
    const {
      size: parentSize,
      disabled: parentDisabled,
      isError: parentIsError,
      isFocused: parentIsFocused,
      setFocused,
      setHasValue,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      showPassword: parentShowPassword,
      setShowPassword: parentSetShowPassword,
      enablePasswordToggle: parentEnablePasswordToggle,
    } = context || {}

    const finalDisabled = disabled ?? parentDisabled
    const isError = parentIsError ?? false

    const handleFocus = (
      e: Parameters<NonNullable<IInputFieldProps['onFocus']>>[0],
    ) => {
      onFocus?.(e)
      setFocused?.(true)
    }

    const handleBlur = (
      e: Parameters<NonNullable<IInputFieldProps['onBlur']>>[0],
    ) => {
      onBlur?.(e)
      setFocused?.(false)
    }

    const handleChangeText = (text: string) => {
      onChangeText?.(text)
      setHasValue?.(text.length > 0)
    }

    const isPasswordToggleActive =
      props.secureTextEntry === true && parentEnablePasswordToggle === true

    const handleTogglePassword = React.useCallback(() => {
      if (parentSetShowPassword) {
        parentSetShowPassword(!parentShowPassword)
      }
    }, [parentShowPassword, parentSetShowPassword])

    const finalSecureTextEntry = isPasswordToggleActive
      ? !parentShowPassword
      : props.secureTextEntry

    const placeholderColor =
      placeholderTextColor || (finalDisabled ? '#a4acb9' : '#818898')

    // Determine if we should show a right icon
    // Show icon if: custom RightIcon exists OR password toggle is active
    const shouldShowRightIcon = !!RightIcon || isPasswordToggleActive

    // Generate stable className without focus/error state variants
    const fieldStyle = React.useMemo(
      () =>
        inputFieldStyle({
          size: size || parentSize,
          disabled: finalDisabled,
          hasLeftIcon: !!LeftIcon,
          hasRightIcon: shouldShowRightIcon,
          isError, // Keep error in className as it doesn't cause focus issues
          class: className,
        }),
      [
        size,
        parentSize,
        finalDisabled,
        LeftIcon,
        shouldShowRightIcon,
        isError,
        className,
      ],
    )

    const finalSize = size || parentSize
    const inputHeight = finalSize === 'sm' ? 40 : 48
    const iconSize = finalSize === 'sm' ? 20 : 24
    const iconTop = (inputHeight - iconSize) / 2

    // Icon color: use strokeIconColor if provided, otherwise use default based on disabled state
    // greyscale-400 = rgb(129 136 152) = #818898, greyscale-300 = rgb(164 172 185) = #a4acb9
    const iconColor = strokeIconColor || (finalDisabled ? '#a4acb9' : '#818898')

    const showOutline = parentIsFocused && !finalDisabled && !hideOutline
    const borderRadius = finalSize === 'sm' ? 8 : 10

    // Use inline styles for focus effects to avoid className changes
    const focusStyle = React.useMemo(() => {
      if (!showOutline) return {}

      return {
        shadowColor: isError ? '#dc2626' : '#3F46F9',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      }
    }, [showOutline, isError])

    const borderStyle = React.useMemo(() => {
      if (!showOutline) return {}

      return {
        borderColor: isError ? '#dc2626' : '#3F46F9',
        borderWidth: 1,
      }
    }, [showOutline, isError])

    return (
      <View className="relative">
        <View
          key="outline"
          className="absolute border-2"
          style={[
            {
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              opacity: showOutline ? (isError ? 0.24 : 0.2) : 0,
              borderRadius: borderRadius + 3,
              borderColor: isError ? '#dc2626' : '#8B8FFC',
              pointerEvents: 'none',
              zIndex: 0,
            },
          ]}
        />
        <View
          key="input-container"
          className={fieldStyle}
          style={[
            focusStyle,
            borderStyle,
            {
              zIndex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: LeftIcon ? 44 : 12,
              paddingRight: shouldShowRightIcon ? 44 : 12,
            },
          ]}>
          <UIInput.Input
            key="input-field"
            ref={ref}
            {...props}
            secureTextEntry={finalSecureTextEntry}
            editable={!finalDisabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChangeText={handleChangeText}
            placeholderTextColor={placeholderColor}
            style={[
              {
                flex: 1,
                height: '100%',
                textAlign: I18nManager.isRTL ? 'right' : 'left',
                paddingTop: 0,
                paddingBottom: 0,
                paddingLeft: 0,
                paddingRight: 0,
                color: finalDisabled ? '#a4acb9' : '#111827',
                fontSize: finalSize === 'sm' ? 14 : 16,
                fontFamily: 'Inter-Regular', // Matching font-inter
              },
              props.style,
            ]}
          />
        </View>
        {LeftIcon && (
          <View
            style={{
              position: 'absolute',
              left: 12,
              top: iconTop,
              zIndex: 50,
              pointerEvents: 'none',
              elevation: 999,
            }}>
            <InputIconInternal as={LeftIcon} color={iconColor} />
          </View>
        )}
        {(() => {
          if (isPasswordToggleActive) {
            // If custom rightIcon is provided, use it as toggle button
            if (RightIcon) {
              return (
                <Pressable
                  onPress={handleTogglePassword}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    paddingHorizontal: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 999,
                    zIndex: 20,
                  }}>
                  <View pointerEvents="none">
                    <InputIconInternal as={RightIcon} color={iconColor} />
                  </View>
                </Pressable>
              )
            }

            // Otherwise, use Eye/EyeOff icons from lucide-react-native
            const EyeIcon = parentShowPassword ? Eye : EyeClosed
            return (
              <Pressable
                onPress={handleTogglePassword}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  bottom: 0,
                  paddingHorizontal: 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                  elevation: 999,
                  zIndex: 20,
                }}>
                <View pointerEvents="none">
                  <EyeIcon size={iconSize} color={iconColor} />
                </View>
              </Pressable>
            )
          }

          // Default behavior when toggle is not active

          if (RightIcon) {
            return (
              <View
                style={{
                  position: 'absolute',
                  right: 12,
                  top: iconTop,
                  elevation: 999,
                  zIndex: 20,
                  pointerEvents: 'none',
                }}>
                <InputIconInternal as={RightIcon} color={iconColor} />
              </View>
            )
          }

          return null
        })()}
      </View>
    )
  },
)

type IInputIcon = React.ComponentProps<typeof UIInput.Icon> &
  VariantProps<typeof inputIconStyle> & {
    className?: string | undefined
    height?: number
    width?: number
  }

const InputIconInternal = React.forwardRef<
  React.ElementRef<typeof UIInput.Icon>,
  IInputIcon
>(({ className, size, disabled, ...props }, ref) => {
  const { size: parentSize, disabled: parentDisabled } = useStyleContext(SCOPE)

  const finalDisabled = disabled ?? parentDisabled

  if (typeof size === 'number') {
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({
          parentVariants: {
            size: parentSize,
            disabled: finalDisabled,
          },
          class: className,
        })}
        size={size}
      />
    )
  } else if (
    (props.height !== undefined || props.width !== undefined) &&
    size === undefined
  ) {
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({
          parentVariants: {
            size: parentSize,
            disabled: finalDisabled,
          },
          class: className,
        })}
      />
    )
  }
  return (
    <UIInput.Icon
      {...props}
      className={inputIconStyle({
        parentVariants: {
          size: parentSize || size,
          disabled: finalDisabled,
        },
        size,
        disabled: finalDisabled,
        class: className,
      })}
      ref={ref}
    />
  )
})

type IInputHintProps = React.ComponentPropsWithoutRef<typeof Text> & {
  className?: string
}

const InputHintInternal = React.forwardRef<
  React.ElementRef<typeof Text>,
  IInputHintProps
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      {...props}
      className={inputHintStyle({ class: className })}
    />
  )
})

type IInputErrorProps = React.ComponentPropsWithoutRef<typeof Text> & {
  className?: string
}

const InputErrorInternal = React.forwardRef<
  React.ElementRef<typeof Text>,
  IInputErrorProps
>(({ className, ...props }, ref) => {
  return (
    <Text
      ref={ref}
      {...props}
      className={inputErrorStyle({ class: className })}
    />
  )
})

Input.displayName = 'Input'
InputFieldInternal.displayName = 'InputFieldInternal'
InputIconInternal.displayName = 'InputIconInternal'
InputHintInternal.displayName = 'InputHintInternal'
InputErrorInternal.displayName = 'InputErrorInternal'

export { Input }
