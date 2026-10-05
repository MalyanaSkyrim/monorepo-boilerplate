'use client'

import { createRadio } from '@gluestack-ui/core/radio/creator'
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils'
import { cssInterop } from 'nativewind'
import React from 'react'
import { Platform, Pressable, Text, View } from 'react-native'

const SCOPE = 'RADIO'

// Type definitions for context values
interface RadioContextValue {
  size?: 'sm' | 'md'
  disabled?: boolean
  variant?: 'default' | 'cards' | 'custom'
}

interface RadioIndicatorPropsWithData {
  'data-focus-visible'?: boolean
  'data-focus'?: boolean
  'data-checked'?: boolean
}

// Apply cssInterop to base components before using them
cssInterop(View, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(Pressable, { className: 'style' })

const Root = (
  Platform.OS === 'web'
    ? withStyleContext(View, SCOPE)
    : withStyleContext(Pressable, SCOPE)
) as ReturnType<typeof withStyleContext<typeof Pressable>>

const UIRadio = createRadio({
  Root: Root,
  Group: View,
  Icon: View, // Use View for the white circle dot
  Indicator: View,
  Label: Text,
})

const radioStyle = tva({
  base: 'group/radio flex-row justify-start items-center web:cursor-pointer',
  variants: {
    size: {
      sm: 'gap-1.5',
      md: 'gap-2',
    },
    disabled: {
      true: 'web:cursor-not-allowed',
      false: 'web:cursor-pointer',
    },
  },
  defaultVariants: {
    size: 'md',
    disabled: false,
  },
})

const radioGroupStyle = tva({
  base: 'gap-2 flex-col',
})

const radioGroupCardStyle = tva({
  base: 'gap-4 flex-col',
})

const radioGroupCustomStyle = tva({
  base: 'gap-4 flex-col',
})

const radioCardStyle = tva({
  base: 'rounded-xl p-4 flex-row items-center justify-between gap-4 bg-white border-2 border-greyscale-100 web:cursor-pointer data-[checked=true]:bg-primary-0 data-[checked=true]:border-primary-300 data-[hover=true]:border-greyscale-200',
  variants: {
    disabled: {
      true: 'web:cursor-not-allowed opacity-40',
      false: 'web:cursor-pointer',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

const radioCustomStyle = tva({
  base: 'web:cursor-pointer',
  variants: {
    disabled: {
      true: 'web:cursor-not-allowed opacity-40',
      false: 'web:cursor-pointer',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

const radioIndicatorStyle = tva({
  base: 'rounded-full justify-center items-center border-2 border-greyscale-100 data-[hover=true]:bg-greyscale-50 data-[hover=true]:border-greyscale-100 data-[checked=true]:bg-primary-300 data-[checked=true]:border-primary-300 data-[hover=true]:data-[checked=true]:bg-[#2b2aba] data-[hover=true]:data-[checked=true]:border-[#2b2aba]',
  variants: {
    disabled: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      disabled: true,
      class:
        'data-[checked=false]:bg-greyscale-25 data-[checked=false]:border-greyscale-100 data-[checked=true]:bg-primary-25 data-[checked=true]:border-primary-25',
    },
  ],
  parentVariants: {
    size: {
      sm: 'h-4 w-4', // 16px
      md: 'h-5 w-5', // 20px
    },
  },
})

const radioDotStyle = tva({
  base: 'rounded-full bg-white data-[checked=false]:opacity-0 data-[checked=true]:opacity-100',
  parentVariants: {
    size: {
      sm: 'h-1.5 w-1.5', // 6px for small
      md: 'h-2 w-2', // 8px for medium
    },
  },
})

const radioLabelStyle = tva({
  base: 'text-greyscale-900',
  variants: {
    disabled: {
      true: 'opacity-40',
      false: '',
    },
  },
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
    },
  },
})

type IRadioProps = Omit<
  React.ComponentProps<typeof UIRadio>,
  'context' | 'disabled' | 'isInvalid'
> &
  VariantProps<typeof radioStyle> & {
    /** Value for the radio button - required */
    value: string
    /** Size variant */
    size?: 'sm' | 'md'
    /** Whether radio is invalid/error state */
    isInvalid?: boolean
    /** Whether radio is disabled */
    isDisabled?: boolean
    /** Custom className */
    className?: string
    /** Custom style */
    style?: React.ComponentProps<typeof View>['style']
  }

type IRadioIndicatorProps = React.ComponentProps<typeof UIRadio.Indicator> &
  VariantProps<typeof radioIndicatorStyle> & {
    /** Custom className */
    className?: string
  }

type IRadioLabelProps = React.ComponentProps<typeof UIRadio.Label> &
  VariantProps<typeof radioLabelStyle> & {
    /** Custom className */
    className?: string
  }

type IRadioDotProps = React.ComponentProps<typeof UIRadio.Icon> &
  VariantProps<typeof radioDotStyle> & {
    /** Custom className */
    className?: string
    /** Custom height */
    height?: number
    /** Custom width */
    width?: number
  }

// Internal Radio component (not exported)
const RadioInternal = React.forwardRef<
  React.ComponentRef<typeof UIRadio>,
  IRadioProps
>(function RadioInternal(
  { className, size = 'md', value, isInvalid, isDisabled, ...props },
  ref,
) {
  return (
    <UIRadio
      className={radioStyle({ class: className, size, disabled: isDisabled })}
      {...props}
      ref={ref}
      value={value}
      disabled={isDisabled}
      isInvalid={isInvalid}
      context={{ size, disabled: isDisabled }}
    />
  )
})

export type RadioOption = {
  label: React.ReactNode | string
  value: string
}

export type RadioCustomOption = {
  value: string
  render: (props: { isSelected: boolean }) => React.ReactNode
}

// Internal Radio Card component (not exported)
type IRadioCardProps = Omit<
  React.ComponentProps<typeof UIRadio>,
  'context' | 'disabled' | 'isInvalid'
> & {
  /** Value for the radio button - required */
  value: string
  /** Label content (ReactNode or string) */
  label: React.ReactNode | string
  /** Whether radio is invalid/error state */
  isInvalid?: boolean
  /** Whether radio is disabled */
  isDisabled?: boolean
  /** Custom className */
  className?: string
  /** Custom style */
  style?: React.ComponentProps<typeof View>['style']
}

const RadioCardInternal = React.forwardRef<
  React.ComponentRef<typeof UIRadio>,
  IRadioCardProps
>(function RadioCardInternal(
  { className, value, label, isInvalid, isDisabled, ...props },
  ref,
) {
  return (
    <UIRadio
      className={radioCardStyle({ class: className, disabled: isDisabled })}
      {...props}
      ref={ref}
      value={value}
      disabled={isDisabled}
      isInvalid={isInvalid}
      context={{ size: 'md', disabled: isDisabled, variant: 'cards' }}>
      {/* Content area on the left */}
      <View className="flex-1">
        {typeof label === 'string' ? (
          <Text className="text-greyscale-900">{label}</Text>
        ) : (
          label
        )}
      </View>
      {/* Radio indicator on the right */}
      <RadioIndicatorInternal />
    </UIRadio>
  )
})

// Internal Radio Custom component (not exported)
type IRadioCustomProps = Omit<
  React.ComponentProps<typeof UIRadio>,
  'context' | 'disabled' | 'isInvalid' | 'children'
> & {
  /** Value for the radio button - required */
  value: string
  /** Custom render function that receives isSelected state */
  render: (props: { isSelected: boolean }) => React.ReactNode
  /** Whether radio is invalid/error state */
  isInvalid?: boolean
  /** Whether radio is disabled */
  isDisabled?: boolean
  /** Custom className */
  className?: string
  /** Custom style */
  style?: React.ComponentProps<typeof View>['style']
  /** Current selected value from RadioGroup */
  selectedValue?: string
  /** Layout direction - row or column, by default column */
  direction?: 'row' | 'column'
}

const RadioCustomInternal = React.forwardRef<
  React.ComponentRef<typeof UIRadio>,
  IRadioCustomProps
>(function RadioCustomInternal(
  {
    className,
    value,
    render,
    isInvalid,
    isDisabled,
    selectedValue,
    direction,
    ...props
  },
  ref,
) {
  // Compare in a useMemo to avoid recalculating on every render
  const isSelected = React.useMemo(
    () => selectedValue === value,
    [selectedValue, value],
  )

  // Memoize the rendered content
  const content = React.useMemo(
    () => render({ isSelected }),
    [render, isSelected],
  )

  return (
    <UIRadio
      className={radioCustomStyle({ class: className, disabled: isDisabled })}
      {...props}
      ref={ref}
      value={value}
      style={{ flex: direction === 'row' ? 1 : undefined }}
      disabled={isDisabled}
      isInvalid={isInvalid}
      context={{ size: 'md', disabled: isDisabled, variant: 'custom' }}>
      {content}
    </UIRadio>
  )
})

type IRadioGroupProps = Omit<
  React.ComponentProps<typeof UIRadio.Group>,
  'children' | 'onChange'
> &
  VariantProps<typeof radioGroupStyle> & {
    /** Array of radio options (for default and cards variants) */
    options?: RadioOption[]
    /** Array of custom radio options (for custom variant) */
    customOptions?: RadioCustomOption[]
    /** Current selected value (controlled) */
    value?: string
    /** Default selected value (uncontrolled) */
    defaultValue?: string
    /** Callback when value changes */
    onChange?: (value: string) => void
    /** Size variant (applies to all radios) */
    size?: 'sm' | 'md'
    /** Variant style - default, cards, or custom */
    variant?: 'default' | 'cards' | 'custom'
    /** Custom className */
    className?: string
    /** Children for backward compatibility - if provided, options prop is ignored */
    children?: React.ReactNode
    /** Layout direction - row or column, by default column */
    direction?: 'row' | 'column'
  }

const RadioGroup = React.forwardRef<
  React.ComponentRef<typeof UIRadio.Group>,
  IRadioGroupProps
>(function RadioGroup(
  {
    className,
    options = [],
    customOptions = [],
    size = 'md',
    variant = 'default',
    direction = 'column',
    children,
    onChange,
    value: controlledValue,
    defaultValue,
    ...props
  },
  ref,
) {
  // Handle uncontrolled mode with defaultValue
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')

  // Determine if component is controlled
  const isControlled = controlledValue !== undefined

  // Use controlled value if provided, otherwise use internal value
  const currentValue = isControlled ? controlledValue : internalValue

  // Handle change events
  const handleChange = React.useCallback(
    (newValue: string) => {
      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue)
      }
      // Call user's onChange callback
      onChange?.(newValue)
    },
    [isControlled, onChange],
  )

  // If children are provided, use them directly (backward compatibility)
  if (children) {
    return (
      <UIRadio.Group
        className={
          variant === 'cards'
            ? radioGroupCardStyle({ class: className })
            : radioGroupStyle({ class: className })
        }
        {...props}
        value={currentValue}
        onChange={handleChange}
        ref={ref}>
        {children}
      </UIRadio.Group>
    )
  }

  // Render custom radios from customOptions
  if (variant === 'custom') {
    return (
      <UIRadio.Group
        className={radioGroupCustomStyle({ class: className })}
        {...props}
        style={[props.style, { flexDirection: direction }]}
        value={currentValue}
        onChange={handleChange}
        ref={ref}>
        {customOptions.map((option) => (
          <RadioCustomInternal
            key={option.value}
            value={option.value}
            render={option.render}
            selectedValue={currentValue}
            direction={direction}
          />
        ))}
      </UIRadio.Group>
    )
  }

  // Render radios from options (cards variant)
  if (variant === 'cards') {
    return (
      <UIRadio.Group
        className={radioGroupCardStyle({ class: className })}
        {...props}
        value={currentValue}
        onChange={handleChange}
        ref={ref}>
        {options.map((option) => (
          <RadioCardInternal
            key={option.value}
            value={option.value}
            label={option.label}
          />
        ))}
      </UIRadio.Group>
    )
  }

  // Default variant - render radios from options
  return (
    <UIRadio.Group
      className={radioGroupStyle({ class: className })}
      {...props}
      value={currentValue}
      onChange={handleChange}
      ref={ref}>
      {options.map((option) => (
        <RadioInternal key={option.value} value={option.value} size={size}>
          <RadioIndicatorInternal />
          <RadioLabelInternal>{option.label}</RadioLabelInternal>
        </RadioInternal>
      ))}
    </UIRadio.Group>
  )
})

// Internal components (not exported)
const RadioIndicatorInternal = React.forwardRef<
  React.ComponentRef<typeof UIRadio.Indicator>,
  IRadioIndicatorProps
>(function RadioIndicatorInternal({ className, children, ...props }, ref) {
  const context = useStyleContext(SCOPE) as RadioContextValue | null
  const { size, disabled } = context || {}

  // Extract data attributes to pass to focus outline
  // Type assertion needed because data attributes are added by gluestack-ui at runtime
  const propsWithData = props as IRadioIndicatorProps &
    Partial<RadioIndicatorPropsWithData>

  // Determine if focus outline should be visible: focused AND checked AND not disabled
  const showFocusOutline =
    (propsWithData['data-focus-visible'] || propsWithData['data-focus']) &&
    propsWithData['data-checked'] &&
    !disabled

  return (
    <View className="relative">
      {/* Focus outline - shown when focused AND checked AND not disabled */}
      {showFocusOutline && (
        <View className="border-primary-300 absolute inset-0 -m-[3px] rounded-full border-2 opacity-15" />
      )}
      <UIRadio.Indicator
        className={radioIndicatorStyle({
          disabled: disabled ?? false,
          parentVariants: { size },
          class: className,
        })}
        ref={ref}
        {...props}>
        {/* createRadio automatically sets data-checked on all children */}
        {/* Automatically include white dot if no children provided */}
        {children || <RadioDot />}
      </UIRadio.Indicator>
    </View>
  )
})

const RadioLabelInternal = React.forwardRef<
  React.ComponentRef<typeof UIRadio.Label>,
  IRadioLabelProps & { children?: React.ReactNode }
>(function RadioLabelInternal({ className, children, ...props }, ref) {
  const context = useStyleContext(SCOPE) as RadioContextValue | null
  const { size, disabled } = context || {}

  // If children is a string, use UIRadio.Label (Text component)
  if (typeof children === 'string') {
    return (
      <UIRadio.Label
        className={radioLabelStyle({
          disabled: disabled ?? false,
          parentVariants: { size },
          class: className,
        })}
        ref={ref}
        {...props}>
        {children}
      </UIRadio.Label>
    )
  }

  // If children is ReactNode, render it directly in a View
  // Note: ref is not forwarded here as it's typed for Text, not View
  return (
    <View
      className={radioLabelStyle({
        disabled: disabled ?? false,
        parentVariants: { size },
        class: className,
      })}>
      {children}
    </View>
  )
})

const RadioDot = React.forwardRef<
  React.ComponentRef<typeof UIRadio.Icon>,
  IRadioDotProps
>(function RadioDot({ className, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE)

  // RadioDot is a simple white circle that shows/hides based on checked state
  // The data-checked prop is automatically set by createRadio
  return (
    <UIRadio.Icon
      {...props}
      className={radioDotStyle({
        parentVariants: {
          size: parentSize,
        },
        class: className,
      })}
      ref={ref}
    />
  )
})

RadioInternal.displayName = 'RadioInternal'
RadioCardInternal.displayName = 'RadioCardInternal'
RadioCustomInternal.displayName = 'RadioCustomInternal'
RadioGroup.displayName = 'RadioGroup'
RadioIndicatorInternal.displayName = 'RadioIndicatorInternal'
RadioLabelInternal.displayName = 'RadioLabelInternal'
RadioDot.displayName = 'RadioDot'

export { RadioGroup }
