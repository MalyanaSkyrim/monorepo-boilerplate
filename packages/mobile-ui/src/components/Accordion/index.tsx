'use client'

import { createAccordion } from '@gluestack-ui/core/accordion/creator'
import { PrimitiveIcon, UIIcon } from '@gluestack-ui/core/icon/creator'
import {
  tva,
  useStyleContext,
  withStyleContext,
  type VariantProps,
} from '@gluestack-ui/utils/nativewind-utils'
import { ChevronDown, ChevronUp } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

const SCOPE = 'ACCORDION'

// Apply cssInterop to base components before using them
cssInterop(Pressable, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(View, { className: 'style' })

const Root = withStyleContext(View, SCOPE)

const UIAccordion = createAccordion({
  Root: Root,
  Item: View,
  Header: View,
  Trigger: Pressable,
  TitleText: Text,
  Content: View,
  ContentText: Text,
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

const accordionStyle = tva({
  base: 'w-full',
  variants: {
    variant: {
      filled: 'bg-white',
      unfilled: '',
    },
    size: {
      sm: '',
      md: '',
      lg: '',
    },
  },
  defaultVariants: {
    variant: 'filled',
    size: 'md',
  },
})

const accordionItemStyle = tva({
  base: 'overflow-hidden',
  parentVariants: {
    variant: {
      filled: 'bg-background-0',
      unfilled: 'bg-transparent',
    },
  },
})

const accordionHeaderStyle = tva({
  base: 'mx-0 my-0',
})

const accordionTriggerStyle = tva({
  base: 'w-full flex-row justify-between items-center web:outline-none focus:outline-none data-[disabled=true]:opacity-40 data-[disabled=true]:cursor-not-allowed data-[focus-visible=true]:bg-background-50 py-3 px-4',
})

const accordionTitleTextStyle = tva({
  base: 'text-typography-900 font-bold flex-1 text-left font-inter',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
})

const accordionIconStyle = tva({
  base: 'text-typography-900 fill-none',
  parentVariants: {
    size: {
      '2xs': 'h-3 w-3',
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      md: 'h-[18px] w-[18px]',
      lg: 'h-5 w-5',
      xl: 'h-6 w-6',
    },
  },
})

const accordionContentStyle = tva({
  base: 'pt-1 pb-3 px-4',
})

const accordionContentTextStyle = tva({
  base: 'text-typography-700 font-normal font-inter',
  parentVariants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
})

type AccordionItem = {
  value: string
  title: string
  content: string | React.ReactNode
}

type AccordionProps = Omit<
  React.ComponentPropsWithoutRef<typeof UIAccordion>,
  'context' | 'children'
> &
  VariantProps<typeof accordionStyle> & {
    items: AccordionItem[]
    variant?: 'filled' | 'unfilled'
    size?: 'sm' | 'md' | 'lg'
    type?: 'single' | 'multiple'
    isCollapsible?: boolean
    defaultValue?: string[]
    value?: string[]
    onValueChange?: (value: string[]) => void
    isDisabled?: boolean
    className?: string
  }

const Accordion = React.forwardRef<
  React.ElementRef<typeof UIAccordion>,
  AccordionProps
>(
  (
    {
      items,
      className,
      variant = 'filled',
      size = 'md',
      type = 'single',
      isCollapsible = true,
      ...props
    },
    ref,
  ) => {
    return (
      <UIAccordion
        ref={ref}
        type={type}
        isCollapsible={isCollapsible}
        {...props}
        className={accordionStyle({ variant, size, class: className })}
        context={{ variant, size }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <AccordionItemInternal
              key={item.value}
              value={item.value}
              isLast={isLast}>
              <AccordionHeaderInternal>
                <AccordionTriggerInternal>
                  {({ isExpanded }: { isExpanded: boolean }) => (
                    <>
                      <AccordionTitleTextInternal>
                        {item.title}
                      </AccordionTitleTextInternal>
                      {isExpanded ? (
                        <AccordionIconInternal as={ChevronUp} />
                      ) : (
                        <AccordionIconInternal as={ChevronDown} />
                      )}
                    </>
                  )}
                </AccordionTriggerInternal>
              </AccordionHeaderInternal>
              <AccordionContentInternal>
                {typeof item.content === 'string' ? (
                  <AccordionContentTextInternal>
                    {item.content}
                  </AccordionContentTextInternal>
                ) : (
                  item.content
                )}
              </AccordionContentInternal>
            </AccordionItemInternal>
          )
        })}
      </UIAccordion>
    )
  },
)

Accordion.displayName = 'Accordion'

type IAccordionItemProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Item
> &
  VariantProps<typeof accordionItemStyle> & {
    className?: string
    isLast?: boolean
  }

const AccordionItemInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Item>,
  IAccordionItemProps
>(({ className, style, isLast, ...props }, ref) => {
  const { variant } = useStyleContext(SCOPE)

  const borderStyle = isLast
    ? { borderBottomWidth: 0 }
    : {
        borderBottomWidth: 1,
        borderBottomColor: '#dfe1e7', // greyscale-100
      }

  return (
    <UIAccordion.Item
      ref={ref}
      {...props}
      className={accordionItemStyle({
        parentVariants: { variant },
        class: className,
      })}
      style={[borderStyle, style]}
    />
  )
})

AccordionItemInternal.displayName = 'AccordionItemInternal'

type IAccordionHeaderProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Header
> &
  VariantProps<typeof accordionHeaderStyle> & {
    className?: string
  }

const AccordionHeaderInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Header>,
  IAccordionHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Header
      ref={ref}
      {...props}
      className={accordionHeaderStyle({ class: className })}
    />
  )
})

AccordionHeaderInternal.displayName = 'AccordionHeaderInternal'

type IAccordionTriggerProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Trigger
> &
  VariantProps<typeof accordionTriggerStyle> & {
    className?: string
  }

const AccordionTriggerInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Trigger>,
  IAccordionTriggerProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Trigger
      ref={ref}
      {...props}
      className={accordionTriggerStyle({ class: className })}
    />
  )
})

AccordionTriggerInternal.displayName = 'AccordionTriggerInternal'

type IAccordionTitleTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.TitleText
> &
  VariantProps<typeof accordionTitleTextStyle> & {
    className?: string
  }

const AccordionTitleTextInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.TitleText>,
  IAccordionTitleTextProps
>(({ className, size, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE)

  return (
    <UIAccordion.TitleText
      ref={ref}
      {...props}
      className={accordionTitleTextStyle({
        parentVariants: { size: size ?? parentSize },
        size,
        class: className,
      })}
    />
  )
})

AccordionTitleTextInternal.displayName = 'AccordionTitleTextInternal'

type IAccordionIconProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Icon
> &
  VariantProps<typeof accordionIconStyle> & {
    className?: string
    as?: React.ElementType
    height?: number
    width?: number
  }

const AccordionIconInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Icon>,
  IAccordionIconProps
>(({ className, size, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE)

  const iconSize = size ?? parentSize ?? 'md'

  if (
    typeof size === 'number' ||
    props.height !== undefined ||
    props.width !== undefined
  ) {
    return (
      <UIAccordion.Icon
        ref={ref}
        {...props}
        className={accordionIconStyle({
          parentVariants: { size: undefined },
          class: className,
        })}
        size={size}
      />
    )
  }

  return (
    <UIAccordion.Icon
      ref={ref}
      {...props}
      className={accordionIconStyle({
        parentVariants: { size: iconSize },
        class: className,
      })}
    />
  )
})

AccordionIconInternal.displayName = 'AccordionIconInternal'

type IAccordionContentProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.Content
> &
  VariantProps<typeof accordionContentStyle> & {
    className?: string
  }

const AccordionContentInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.Content>,
  IAccordionContentProps
>(({ className, ...props }, ref) => {
  return (
    <UIAccordion.Content
      ref={ref}
      {...props}
      className={accordionContentStyle({ class: className })}
    />
  )
})

AccordionContentInternal.displayName = 'AccordionContentInternal'

type IAccordionContentTextProps = React.ComponentPropsWithoutRef<
  typeof UIAccordion.ContentText
> &
  VariantProps<typeof accordionContentTextStyle> & {
    className?: string
  }

const AccordionContentTextInternal = React.forwardRef<
  React.ElementRef<typeof UIAccordion.ContentText>,
  IAccordionContentTextProps
>(({ className, size, ...props }, ref) => {
  const { size: parentSize } = useStyleContext(SCOPE)

  return (
    <UIAccordion.ContentText
      ref={ref}
      {...props}
      className={accordionContentTextStyle({
        parentVariants: { size: size ?? parentSize },
        size,
        class: className,
      })}
    />
  )
})

AccordionContentTextInternal.displayName = 'AccordionContentTextInternal'

export { Accordion }
export type { AccordionItem, AccordionProps }
