'use client'

import { tva, type VariantProps } from '@gluestack-ui/utils/nativewind-utils'
import { cssInterop } from 'nativewind'
import React from 'react'
import { Text } from 'react-native'

// Apply cssInterop to base components
cssInterop(Text, { className: 'style' })

const labelStyle = tva({
  base: 'font-medium font-inter text-greyscale-900',
  variants: {
    size: {
      lg: 'text-[14px]',
      sm: 'text-[14px]',
    },
    disabled: {
      true: 'text-greyscale-300',
      false: '',
    },
  },
  defaultVariants: {
    size: 'lg',
    disabled: false,
  },
})

type ILabelProps = React.ComponentPropsWithoutRef<typeof Text> &
  VariantProps<typeof labelStyle> & {
    className?: string
  }

const Label = React.forwardRef<React.ElementRef<typeof Text>, ILabelProps>(
  ({ className, size = 'lg', disabled = false, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        {...props}
        className={labelStyle({
          size,
          disabled,
          class: className,
        })}
      />
    )
  },
)

Label.displayName = 'Label'

export { Label }
