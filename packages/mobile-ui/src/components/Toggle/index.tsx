'use client'

import {
  tva,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils'
import { cssInterop } from 'nativewind'
import React from 'react'
import { Animated, Pressable, View } from 'react-native'

const SCOPE = 'TOGGLE'

// Apply cssInterop to base components before using them
cssInterop(View, { className: 'style' })
cssInterop(Pressable, { className: 'style' })

const Root = withStyleContext(Pressable, SCOPE)

const toggleStyle = tva({
  base: 'flex-row items-center rounded-full p-0.5 data-[focus=true]:outline-0 data-[disabled=true]:opacity-40',
  variants: {
    size: {
      sm: 'w-9 h-5', // 36×20px
      md: 'w-11 h-6', // 44×24px
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

type IToggleProps = React.ComponentProps<typeof Root> &
  VariantProps<typeof toggleStyle> & {
    /** Controlled value - whether toggle is active */
    value?: boolean
    /** Uncontrolled default value */
    defaultValue?: boolean
    /** Callback when toggle value changes */
    onValueChange?: (value: boolean) => void
    /** Size variant */
    size?: 'sm' | 'md'
    /** Whether toggle is disabled */
    disabled?: boolean
    /** Custom className */
    className?: string
    /** Custom style */
    style?: React.ComponentProps<typeof View>['style']
  }

const Toggle = React.forwardRef<React.ElementRef<typeof Root>, IToggleProps>(
  (
    {
      className,
      size = 'md',
      disabled = false,
      value: controlledValue,
      defaultValue,
      onValueChange,
      style,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [internalValue, setInternalValue] = React.useState(
      defaultValue ?? false,
    )

    // Support both controlled and uncontrolled modes
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    // Animation values
    const translateX = React.useRef(
      new Animated.Value(value ? (size === 'md' ? 20 : 16) : 0),
    ).current

    // Update animation when value changes
    React.useEffect(() => {
      const targetPosition = value ? (size === 'md' ? 20 : 16) : 0
      Animated.timing(translateX, {
        toValue: targetPosition,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }, [value, size, translateX])

    const handlePress = () => {
      if (disabled) return

      const newValue = !value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    const handleFocus = () => {
      if (disabled) return
      setIsFocused(true)
    }

    const handleBlur = () => {
      if (disabled) return
      setIsFocused(false)
    }

    // Calculate dimensions
    const containerWidth = size === 'md' ? 44 : 36
    const containerHeight = size === 'md' ? 24 : 20
    const buttonSize = size === 'md' ? 20 : 16
    const borderRadius = 12

    // Determine background color
    const backgroundColor = disabled
      ? '#f6f8fa' // Greyscale/25
      : value
        ? '#3f46f9' // Primary/300
        : '#eceff3' // Greyscale/50

    // Button background color
    const buttonBackgroundColor = disabled
      ? '#eceff3' // Greyscale/50
      : '#ffffff' // White

    // Shadow styles (only when not disabled and not focused)
    const buttonShadowStyle =
      !disabled && !isFocused
        ? {
            shadowColor: '#0f1819',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3, // Android
          }
        : {}

    return (
      <View className="relative" style={style}>
        {/* Focus outline */}
        {isFocused && !disabled && (
          <View
            className="border-primary-300 absolute inset-0 border-2"
            style={{
              opacity: 0.15,
              margin: -3,
              borderRadius: borderRadius + 3,
              width: containerWidth + 6,
              height: containerHeight + 6,
            }}
          />
        )}
        <Root
          ref={ref}
          {...props}
          disabled={disabled}
          onPress={handlePress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={toggleStyle({
            size,
            class: className,
          })}
          context={{
            size,
            disabled,
            isFocused,
            value,
          }}
          style={[
            {
              width: containerWidth,
              height: containerHeight,
              borderRadius,
              backgroundColor,
            },
          ]}
          pointerEvents={disabled ? 'none' : 'auto'}>
          <Animated.View
            style={{
              width: buttonSize,
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: buttonBackgroundColor,
              transform: [{ translateX }],
              ...buttonShadowStyle,
            }}
          />
        </Root>
      </View>
    )
  },
)

Toggle.displayName = 'Toggle'

export { Toggle }
