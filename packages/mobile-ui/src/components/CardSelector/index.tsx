'use client'

import { createCheckbox } from '@gluestack-ui/core/checkbox/creator'
import { tva, withStyleContext } from '@gluestack-ui/utils/nativewind-utils'
import { CheckIcon } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

const SCOPE = 'CARD_SELECTOR'

// Apply cssInterop to base components before using them
cssInterop(View, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(Pressable, { className: 'style' })

const Root = withStyleContext(Pressable, SCOPE)

const UICheckbox = createCheckbox({
  Root: Root,
  Group: View,
  Icon: View,
  Indicator: View,
  Label: Text,
})

const cardSelectorGroupStyle = tva({
  base: 'gap-4 flex-col',
})

const cardSelectorCardStyle = tva({
  base: 'rounded-xl p-4 flex-row items-center justify-between gap-4 bg-white border-2 border-greyscale-100 web:cursor-pointer data-[checked=true]:bg-primary-0 data-[checked=true]:border-primary-300 data-[hover=true]:border-greyscale-200',
})

const checkIconStyle = tva({
  base: 'text-primary-200',
  parentVariants: {},
})

const checkIndicatorStyle = tva({
  base: 'data-[checked=false]:opacity-0 data-[checked=true]:opacity-100 w-6 h-6 items-center justify-center',
})

type CardSelectorItem = {
  value: string
  label: string | React.ReactNode
}

type ICardSelectorProps = Omit<
  React.ComponentProps<typeof UICheckbox.Group>,
  'children' | 'onChange' | 'value'
> & {
  /** Array of card items to display */
  items: CardSelectorItem[]
  /** Current selected values (controlled) */
  value?: string[]
  /** Default selected values (uncontrolled) */
  defaultValue?: string[]
  /** Callback when selected values change */
  onChange?: (values: string[]) => void
  /** Custom className */
  className?: string
}

// Internal Card component (not exported)
type ICardSelectorCardProps = Omit<
  React.ComponentProps<typeof UICheckbox>,
  'context' | 'disabled' | 'isInvalid' | 'isChecked' | 'onChange'
> & {
  /** Value for the card - required */
  value: string
  /** Label content (ReactNode or string) */
  label: React.ReactNode | string
  /** Custom className */
  className?: string
  /** Custom style */
  style?: React.ComponentProps<typeof View>['style']
}

const CardSelectorCardInternal = React.forwardRef<
  React.ComponentRef<typeof UICheckbox>,
  ICardSelectorCardProps
>(function CardSelectorCardInternal(
  { className, value, label, ...props },
  ref,
) {
  return (
    <UICheckbox
      className={cardSelectorCardStyle({ class: className })}
      {...props}
      ref={ref}
      value={value}
      context={{ disabled: false }}>
      {/* Content area on the left */}
      <View className="flex-1">
        {typeof label === 'string' ? (
          <Text className="text-greyscale-900">{label}</Text>
        ) : (
          label
        )}
      </View>
      {/* Check icon on the right */}
      <CardSelectorIndicator />
    </UICheckbox>
  )
})

// Internal Indicator component (not exported)
const CardSelectorIndicator = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Indicator>,
  React.ComponentProps<typeof UICheckbox.Indicator>
>(function CardSelectorIndicator({ className, ...props }, ref) {
  return (
    <UICheckbox.Indicator
      {...props}
      className={checkIndicatorStyle({ class: className })}
      ref={ref}>
      {/* createCheckbox automatically sets data-checked on all children */}
      <CardSelectorCheckIcon />
    </UICheckbox.Indicator>
  )
})

// Internal CheckIcon component (not exported)
const CardSelectorCheckIcon = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Icon>,
  React.ComponentProps<typeof UICheckbox.Icon>
>(function CardSelectorCheckIcon({ className, ...props }, ref) {
  // Use primary-200 color for the check icon
  // This matches the text-primary-200 class used on the icon wrapper
  const iconColor = '#656BFA' // primary-200 equivalent (RGB: 101, 107, 250)

  return (
    <UICheckbox.Icon
      {...props}
      className={checkIconStyle({ class: className })}
      ref={ref}>
      <CheckIcon size={24} color={iconColor} />
    </UICheckbox.Icon>
  )
})

const CardSelector = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Group>,
  ICardSelectorProps
>(function CardSelector(
  { className, items, value, defaultValue, onChange, ...props },
  ref,
) {
  // Detect if component is controlled
  const isControlled = value !== undefined

  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = React.useState<string[]>(
    defaultValue ?? [],
  )

  // Current value to use - controlled uses prop, uncontrolled uses internal state
  const currentValue = isControlled ? (value ?? []) : internalValue

  // Handle onChange from checkbox group
  const handleChange = React.useCallback(
    (newValue: string[]) => {
      if (isControlled) {
        // Controlled: call parent's onChange
        onChange?.(newValue)
      } else {
        // Uncontrolled: update internal state
        setInternalValue(newValue)
        onChange?.(newValue)
      }
    },
    [isControlled, onChange],
  )

  // Build group props with proper typing
  // ICheckboxGroup requires value to be present
  const groupProps: React.ComponentProps<typeof UICheckbox.Group> = {
    className: cardSelectorGroupStyle({ class: className }),
    onChange: handleChange,
    value: currentValue,
    ...props,
  }

  return (
    <UICheckbox.Group {...groupProps} ref={ref}>
      {items.map((item) => (
        <CardSelectorCardInternal
          key={item.value}
          value={item.value}
          label={item.label}
        />
      ))}
    </UICheckbox.Group>
  )
})

CardSelector.displayName = 'CardSelector'
CardSelectorCardInternal.displayName = 'CardSelectorCardInternal'
CardSelectorIndicator.displayName = 'CardSelectorIndicator'
CardSelectorCheckIcon.displayName = 'CardSelectorCheckIcon'

export { CardSelector }
export type { CardSelectorItem, ICardSelectorProps }
