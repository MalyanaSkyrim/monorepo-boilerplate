'use client'

import { createCheckbox } from '@gluestack-ui/core/checkbox/creator'
import {
  IPrimitiveIcon,
  PrimitiveIcon,
  UIIcon,
} from '@gluestack-ui/core/icon/creator'
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils'
import {
  tva,
  useStyleContext,
  withStyleContext,
} from '@gluestack-ui/utils/nativewind-utils'
import { CheckIcon, MinusIcon } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import type { TextProps, ViewProps } from 'react-native'
import { Pressable, Text, View } from 'react-native'

const IndicatorWrapper = React.forwardRef<
  React.ComponentRef<typeof View>,
  ViewProps
>(function IndicatorWrapper({ ...props }, ref) {
  return <View {...props} ref={ref} />
})

const LabelWrapper = React.forwardRef<
  React.ComponentRef<typeof Text>,
  TextProps
>(function LabelWrapper({ ...props }, ref) {
  return <Text {...props} ref={ref} />
})

const IconWrapper = React.forwardRef<
  React.ComponentRef<typeof PrimitiveIcon>,
  IPrimitiveIcon
>(function IconWrapper({ ...props }, ref) {
  return <UIIcon {...props} ref={ref} />
})

const SCOPE = 'CHECKBOX'
const UICheckbox = createCheckbox({
  Root: withStyleContext(Pressable, SCOPE),
  Group: View,
  Icon: IconWrapper,
  Label: LabelWrapper,
  Indicator: IndicatorWrapper,
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

const checkboxStyle = tva({
  base: 'group/checkbox flex-row items-center justify-start web:cursor-pointer data-[disabled=true]:cursor-not-allowed',
  variants: {
    size: {
      lg: 'gap-2',
      md: 'gap-2',
      sm: 'gap-1.5',
    },
  },
})

const checkboxIndicatorStyle = tva({
  base: 'justify-center items-center border-greyscale-100 bg-transparent rounded web:data-[focus-visible=true]:outline-none web:data-[focus-visible=true]:ring-2 web:data-[focus-visible=true]:ring-indicator-primary data-[checked=true]:bg-primary-300 data-[checked=true]:border-primary-300 data-[hover=true]:data-[checked=false]:border-greyscale-100 data-[hover=true]:data-[checked=false]:bg-greyscale-25 data-[hover=true]:data-[invalid=true]:border-error-700 data-[hover=true]:data-[checked=true]:bg-[#2b2aba] data-[hover=true]:data-[checked=true]:border-[#2b2aba] data-[hover=true]:data-[checked=true]:data-[disabled=true]:border-greyscale-50 data-[hover=true]:data-[checked=true]:data-[disabled=true]:bg-greyscale-50  data-[hover=true]:data-[checked=true]:data-[disabled=true]:data-[invalid=true]:border-error-700 data-[hover=true]:data-[disabled=true]:border-greyscale-50 data-[hover=true]:data-[disabled=true]:data-[invalid=true]:border-error-700 data-[active=true]:data-[checked=true]:bg-primary-800 data-[active=true]:data-[checked=true]:border-primary-800 data-[invalid=true]:border-error-700 data-[disabled=true]:data-[checked=true]:bg-greyscale-50 data-[disabled=true]:data-[checked=true]:border-greyscale-50 data-[disabled=true]:bg-greyscale-50 data-[disabled=true]:border-greyscale-50 data-[checked=true]:text-white',
  parentVariants: {
    size: {
      lg: 'w-6 h-6 border-[3px]',
      md: 'w-5 h-5 border-2',
      sm: 'w-4 h-4 border-2',
    },
  },
})

const checkboxLabelStyle = tva({
  base: 'text-typography-600 data-[checked=true]:text-typography-900 data-[hover=true]:text-typography-900 data-[hover=true]:data-[checked=true]:text-typography-900 data-[hover=true]:data-[checked=true]:data-[disabled=true]:text-typography-900 data-[hover=true]:data-[disabled=true]:text-typography-400 data-[active=true]:text-typography-900 data-[active=true]:data-[checked=true]:text-typography-900 data-[disabled=true]:opacity-40 web:select-none',
  parentVariants: {
    size: {
      lg: 'text-lg',
      md: 'text-base',
      sm: 'text-sm',
    },
  },
})

const checkboxIconStyle = tva({
  base: 'fill-current text-transparent',
  variants: {
    state: {
      checked: 'text-white',
      unchecked: 'text-transparent',
      indeterminate: 'text-white',
    },
    disabled: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      state: 'checked',
      disabled: true,
      class: 'text-greyscale-100',
    },
    {
      state: 'indeterminate',
      disabled: true,
      class: 'text-greyscale-100',
    },
  ],
  parentVariants: {
    size: {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    },
  },
  defaultVariants: {
    state: 'unchecked',
    disabled: false,
  },
})

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate'

type ICheckboxProps = Omit<
  React.ComponentPropsWithoutRef<typeof UICheckbox>,
  'isChecked' | 'onChange' | 'children' | 'value'
> &
  VariantProps<typeof checkboxStyle> & {
    state?: CheckboxState
    defaultState?: CheckboxState
    onChange?: (state: CheckboxState) => void
    /** Checkbox label text */
    label?: string
    /** Value for the checkbox (optional, for form compatibility) */
    value?: string
    /** Children for backward compatibility - if provided, label prop is ignored */
    children?: React.ReactNode
  }

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof UICheckbox>,
  ICheckboxProps
>(function Checkbox(
  {
    className,
    size = 'md',
    state,
    defaultState,
    onChange,
    label,
    children,
    value = '',
    ...props
  },
  ref,
) {
  // Detect if component is controlled
  const isControlled = state !== undefined

  // Internal state for uncontrolled mode (defaults to 'unchecked' if defaultState not provided)
  const [uncontrolledState, setUncontrolledState] =
    React.useState<CheckboxState>(defaultState ?? 'unchecked')

  // Handle onChange - convert to state
  const handleChange = React.useCallback(
    (checked: boolean) => {
      // Determine new state based on current state and checked value
      const currentState = isControlled ? state : uncontrolledState
      let newState: CheckboxState

      if (checked) {
        newState = 'checked'
      } else {
        // If currently indeterminate, go to unchecked, otherwise toggle
        newState = currentState === 'indeterminate' ? 'unchecked' : 'unchecked'
      }

      if (isControlled) {
        // Controlled: call parent's onChange
        onChange?.(newState)
      } else {
        // Uncontrolled: update internal state
        setUncontrolledState(newState)
      }
    },
    [isControlled, state, uncontrolledState, onChange],
  )

  // Determine the state to use
  const currentState = isControlled ? state : uncontrolledState
  const disabled = props.isDisabled

  // Convert state to isChecked for gluestack-ui (checked and indeterminate both need indicator visible)
  const isChecked =
    currentState === 'checked' || currentState === 'indeterminate'

  // If children are provided, use them directly (backward compatibility)
  if (children) {
    return (
      <UICheckbox
        ref={ref}
        isChecked={isChecked}
        onChange={handleChange}
        className={checkboxStyle({
          class: className,
          size,
        })}
        value={value}
        {...props}
        context={{
          size,
          state: currentState,
          disabled,
        }}>
        {children}
      </UICheckbox>
    )
  }

  // Compose components based on props
  return (
    <UICheckbox
      ref={ref}
      isChecked={isChecked}
      onChange={handleChange}
      className={checkboxStyle({
        class: className,
        size,
      })}
      value={value}
      {...props}
      context={{
        size,
        state: currentState,
        disabled,
      }}>
      <CheckboxIndicatorInternal />
      {label && <CheckboxLabelInternal>{label}</CheckboxLabelInternal>}
    </UICheckbox>
  )
})

// Internal components (not exported)
type ICheckboxIndicatorProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Indicator
> &
  VariantProps<typeof checkboxIndicatorStyle>

const CheckboxIndicatorInternal = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Indicator>,
  ICheckboxIndicatorProps
>(function CheckboxIndicator({ className, children, ...props }, ref) {
  const { size: parentSize, state } = useStyleContext(SCOPE)

  // Auto-render icons if no children provided
  const shouldAutoRender = !children || React.Children.count(children) === 0

  let iconToRender = null
  if (shouldAutoRender) {
    if (state === 'indeterminate') {
      iconToRender = <CheckboxIcon as={MinusIcon} />
    } else {
      // Show CheckIcon for both checked and unchecked (icon visibility handled by icon styles)
      iconToRender = <CheckboxIcon as={CheckIcon} />
    }
  }

  // Add classes for indeterminate state to match checked state (blue background, white icon)
  const indeterminateClasses =
    state === 'indeterminate' ? 'bg-primary-300 border-primary-300' : ''

  return (
    <UICheckbox.Indicator
      className={checkboxIndicatorStyle({
        parentVariants: {
          size: parentSize,
        },
        class: `${className || ''} ${indeterminateClasses}`.trim(),
      })}
      {...props}
      ref={ref}>
      {iconToRender}
      {children}
    </UICheckbox.Indicator>
  )
})

type ICheckboxLabelProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Label
> &
  VariantProps<typeof checkboxLabelStyle>

const CheckboxLabelInternal = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Label>,
  ICheckboxLabelProps
>(function CheckboxLabelInternal({ className, ...props }, ref) {
  const { size: parentSize } = useStyleContext(SCOPE)
  return (
    <UICheckbox.Label
      className={checkboxLabelStyle({
        parentVariants: {
          size: parentSize,
        },
        class: className,
      })}
      {...props}
      ref={ref}
    />
  )
})

type ICheckboxIconProps = React.ComponentPropsWithoutRef<
  typeof UICheckbox.Icon
> &
  VariantProps<typeof checkboxIconStyle>

const CheckboxIcon = React.forwardRef<
  React.ComponentRef<typeof UICheckbox.Icon>,
  ICheckboxIconProps
>(function CheckboxIcon({ className, size, ...props }, ref) {
  const { size: parentSize, state, disabled } = useStyleContext(SCOPE)

  if (typeof size === 'number') {
    return (
      <UICheckbox.Icon
        ref={ref}
        {...props}
        className={checkboxIconStyle({
          state,
          disabled,
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
      <UICheckbox.Icon
        ref={ref}
        {...props}
        className={checkboxIconStyle({
          state,
          disabled,
          class: className,
        })}
      />
    )
  }

  return (
    <UICheckbox.Icon
      className={checkboxIconStyle({
        parentVariants: {
          size: parentSize,
        },
        state,
        disabled,
        size,
        class: className,
      })}
      {...props}
      ref={ref}
    />
  )
})

Checkbox.displayName = 'Checkbox'
CheckboxIndicatorInternal.displayName = 'CheckboxIndicatorInternal'
CheckboxLabelInternal.displayName = 'CheckboxLabelInternal'
CheckboxIcon.displayName = 'CheckboxIcon'

export { Checkbox }
