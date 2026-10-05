'use client'

import { createButton } from '@gluestack-ui/core/button/creator'
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator'
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils'
import { cssInterop } from 'nativewind'
import React from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

const SCOPE = 'BUTTON'

// Apply cssInterop to base components before using them
cssInterop(Pressable, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(View, { className: 'style' })

const Root = withStyleContext(Pressable, SCOPE)

const UIButton = createButton({
  Root: Root,
  Text,
  Group: View,
  Spinner: ActivityIndicator,
  Icon: UIIcon,
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

const buttonStyle = tva({
  base: 'group/button flex-row items-center justify-center data-[focus-visible=true]:web:outline-none gap-2',
  variants: {
    variant: {
      primary:
        'bg-primary-300 data-[hover=true]:bg-primary-300 data-[active=true]:bg-primary-200 data-[focus-visible=true]:shadow-button-primary-active shadow-button-primary-normal',
      secondary:
        'bg-white border border-greyscale-100 data-[hover=true]:border-greyscale-200 data-[active=true]:border-greyscale-300 data-[focus-visible=true]:shadow-button-secondary-active shadow-button-secondary-normal',
      tertiary:
        'bg-white data-[hover=true]:bg-greyscale-25 data-[active=true]:bg-greyscale-50',
      destructive:
        'bg-error-100 data-[hover=true]:bg-error-100 data-[active=true]:bg-error-200 data-[focus-visible=true]:shadow-button-destructive-active shadow-button-destructive-normal',
      outline:
        'bg-transparent border border-primary-300 data-[hover=true]:bg-background-50 data-[active=true]:bg-primary-0',
      outlineDestructive:
        'bg-transparent border border-error-100 data-[hover=true]:bg-background-50 data-[active=true]:bg-error-25',
      link: 'px-0 bg-transparent shadow-none data-[hover=true]:bg-transparent data-[active=true]:bg-transparent',
    },
    disabled: {
      true: '',
      false: '',
    },
    size: {
      xs: 'px-4 h-[32px] min-w-[32px] rounded-[6px] py-2', // XSmall: 32px height, 6px radius
      sm: 'px-4 h-[40px] min-w-[40px] rounded-lg py-2', // Small: 40px height, 8px radius
      md: 'px-4 h-[48px] min-w-[48px] rounded-[10px] py-2', // Medium: 48px height, 10px radius
      lg: 'px-4 h-[52px] min-w-[52px] rounded-xl py-2', // Large: 52px height, 12px radius
      xl: 'px-4 h-[52px] min-w-[52px] rounded-xl py-2', // Extra Large: same as Large
    },
  },
  compoundVariants: [
    // Remove horizontal padding for link variant
    {
      variant: 'link',
      size: 'xs',
      class: 'px-0',
    },
    {
      variant: 'link',
      size: 'sm',
      class: 'px-0',
    },
    {
      variant: 'link',
      size: 'md',
      class: 'px-0',
    },
    {
      variant: 'link',
      size: 'lg',
      class: 'px-0',
    },
    {
      variant: 'link',
      size: 'xl',
      class: 'px-0',
    },
    // Disabled states
    {
      variant: 'primary',
      disabled: true,
      class: 'bg-greyscale-100 shadow-none',
    },
    {
      variant: 'secondary',
      disabled: true,
      class: 'border-greyscale-100',
    },
    {
      variant: 'tertiary',
      disabled: true,
      class: 'shadow-none',
    },
    {
      variant: 'destructive',
      disabled: true,
      class: 'bg-error-25',
    },
  ],
  defaultVariants: {
    variant: 'primary',
    disabled: false,
  },
})

const buttonTextStyle = tva({
  base: 'font-semibold web:select-none font-inter',
  parentVariants: {
    variant: {
      primary:
        'text-white data-[hover=true]:text-white data-[active=true]:text-white',
      secondary:
        'text-greyscale-900 data-[hover=true]:text-greyscale-900 data-[active=true]:text-greyscale-900',
      tertiary:
        'text-primary-300 data-[hover=true]:text-primary-300 data-[active=true]:text-primary-300',
      destructive:
        'text-white data-[hover=true]:text-white data-[active=true]:text-white',
      outline:
        'text-primary-300 data-[hover=true]:text-primary-300 data-[active=true]:text-primary-300',
      outlineDestructive:
        'text-error-100 data-[hover=true]:text-error-100 data-[active=true]:text-error-100',
      link: 'text-primary-300 data-[hover=true]:text-primary-300 data-[active=true]:text-primary-300 data-[hover=true]:underline data-[active=true]:underline',
    },
    size: {
      xs: 'text-[12px]', // XSmall: 12px
      sm: 'text-[14px]', // Small: 14px
      md: 'text-[16px]', // Medium: 16px
      lg: 'text-[16px]', // Large: 16px
      xl: 'text-[16px]', // Extra Large: 16px
    },
    disabled: {
      true: '',
      false: '',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'primary',
      disabled: true,
      class: 'text-white',
    },
    {
      variant: 'secondary',
      disabled: true,
      class: 'text-greyscale-200',
    },
    {
      variant: 'tertiary',
      disabled: true,
      class: 'text-greyscale-200',
    },
    {
      variant: 'destructive',
      disabled: true,
      class: 'text-white',
    },
  ],
  defaultVariants: {
    disabled: false,
  },
})

const buttonIconStyle = tva({
  base: 'fill-none',
  parentVariants: {
    variant: {},
    size: {
      xs: 'h-4 w-4', // 16px for XSmall and Small
      sm: 'h-5 w-5', // 16px
      md: 'h-6 w-6', // 24px for Medium and Large
      lg: 'h-6 w-6', // 24px
      xl: 'h-6 w-6', // 24px
    },
    disabled: {
      true: '',
      false: '',
    },
  },
  parentCompoundVariants: [
    {
      variant: 'primary',
      disabled: true,
      class: 'text-white',
    },
    {
      variant: 'secondary',
      disabled: true,
      class: 'text-greyscale-200',
    },
    {
      variant: 'tertiary',
      disabled: true,
      class: 'text-greyscale-200',
    },
    {
      variant: 'destructive',
      disabled: true,
      class: 'text-white',
    },
  ],
  defaultVariants: {
    disabled: false,
  },
})

const buttonGroupStyle = tva({
  base: '',
  variants: {
    space: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-5',
      '2xl': 'gap-6',
      '3xl': 'gap-7',
      '4xl': 'gap-8',
    },
    isAttached: {
      true: 'gap-0',
    },
    flexDirection: {
      row: 'flex-row',
      column: 'flex-col',
      'row-reverse': 'flex-row-reverse',
      'column-reverse': 'flex-col-reverse',
    },
  },
})

type IButtonProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIButton>,
  'context' | 'children'
> &
  VariantProps<typeof buttonStyle> & {
    className?: string
    /** Button label text */
    label?: string
    /** Optional icon component */
    icon?: React.ElementType
    /** Icon position relative to label */
    iconPosition?: 'left' | 'right'
    /** Icon className */
    iconClassName?: string
    /** Show loading spinner instead of icon */
    isLoading?: boolean
    /** Children for backward compatibility - if provided, label/icon props are ignored */
    children?: React.ReactNode

    /** Label className */
    labelClassName?: string
  }

const Button = React.forwardRef<
  React.ElementRef<typeof UIButton>,
  IButtonProps
>(
  (
    {
      className,
      iconClassName,
      variant = 'primary',
      size = 'md',
      disabled = false,
      label,
      icon: Icon,
      iconPosition = 'left',
      isLoading = false,
      children,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    // If children are provided, use them directly (backward compatibility)
    if (children) {
      return (
        <UIButton
          ref={ref}
          {...props}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          disabled={disabled || isLoading}
          className={buttonStyle({
            variant,
            size,
            disabled: disabled || isLoading,
            class: className,
          })}
          context={{ variant, size, disabled: disabled || isLoading }}>
          {children}
        </UIButton>
      )
    }

    // Build content based on props
    const iconElement =
      Icon && !isLoading ? (
        <ButtonIconInternal className={iconClassName} as={Icon} />
      ) : null

    const spinnerElement = isLoading ? <ButtonSpinnerInternal /> : null

    const textElement = label ? (
      <ButtonTextInternal className={labelClassName}>
        {label}
      </ButtonTextInternal>
    ) : null

    const content = (
      <>
        {iconPosition === 'left' && (iconElement || spinnerElement)}
        {textElement}
        {iconPosition === 'right' && (iconElement || spinnerElement)}
      </>
    )

    return (
      <UIButton
        ref={ref}
        {...props}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        disabled={disabled || isLoading}
        className={buttonStyle({
          variant,
          size,
          disabled: disabled || isLoading,
          class: className,
        })}
        context={{ variant, size, disabled: disabled || isLoading }}>
        {content}
      </UIButton>
    )
  },
)

type IButtonTextProps = React.ComponentPropsWithoutRef<typeof UIButton.Text> &
  VariantProps<typeof buttonTextStyle> & { className?: string }

const ButtonTextInternal = React.forwardRef<
  React.ElementRef<typeof UIButton.Text>,
  IButtonTextProps
>(({ className, variant, size, disabled, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    disabled: parentDisabled,
  } = useStyleContext(SCOPE)

  return (
    <UIButton.Text
      ref={ref}
      {...props}
      className={buttonTextStyle({
        parentVariants: {
          variant: parentVariant,
          size: parentSize,
          disabled: parentDisabled,
        },
        variant,
        size,
        disabled,
        class: className,
      })}
    />
  )
})

const ButtonSpinnerInternal = UIButton.Spinner

type IButtonIcon = React.ComponentPropsWithoutRef<typeof UIButton.Icon> &
  VariantProps<typeof buttonIconStyle> & {
    className?: string | undefined
    as?: React.ElementType
    height?: number
    width?: number
  }

const ButtonIconInternal = React.forwardRef<
  React.ElementRef<typeof UIButton.Icon>,
  IButtonIcon
>(({ className, size, disabled, ...props }, ref) => {
  const {
    variant: parentVariant,
    size: parentSize,
    disabled: parentDisabled,
  } = useStyleContext(SCOPE)

  const finalDisabled = disabled ?? parentDisabled

  if (typeof size === 'number') {
    return (
      <UIButton.Icon
        ref={ref}
        pointerEvents="none"
        {...props}
        className={buttonIconStyle({
          parentVariants: {
            variant: parentVariant,
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
      <UIButton.Icon
        ref={ref}
        pointerEvents="none"
        {...props}
        className={buttonIconStyle({
          parentVariants: {
            variant: parentVariant,
            disabled: finalDisabled,
          },
          class: className,
        })}
      />
    )
  }
  return (
    <UIButton.Icon
      {...props}
      pointerEvents="none"
      className={buttonIconStyle({
        parentVariants: {
          size: parentSize,
          variant: parentVariant,
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

type IButtonGroupProps = React.ComponentPropsWithoutRef<typeof UIButton.Group> &
  VariantProps<typeof buttonGroupStyle>

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof UIButton.Group>,
  IButtonGroupProps
>(
  (
    {
      className,
      space = 'md',
      isAttached = false,
      flexDirection = 'column',
      ...props
    },
    ref,
  ) => {
    return (
      <UIButton.Group
        className={buttonGroupStyle({
          class: className,
          space,
          isAttached,
          flexDirection,
        })}
        {...props}
        ref={ref}
      />
    )
  },
)

Button.displayName = 'Button'
ButtonTextInternal.displayName = 'ButtonTextInternal'
ButtonSpinnerInternal.displayName = 'ButtonSpinnerInternal'
ButtonIconInternal.displayName = 'ButtonIconInternal'
ButtonGroup.displayName = 'ButtonGroup'

export { Button }
