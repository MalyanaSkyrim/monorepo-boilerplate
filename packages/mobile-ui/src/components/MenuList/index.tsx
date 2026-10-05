'use client'

import { tva } from '@gluestack-ui/utils/nativewind-utils'
import { ChevronLeft, ChevronRight } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import { I18nManager, Pressable, Text, View } from 'react-native'

// Apply cssInterop to base components
cssInterop(View, { className: 'style' })
cssInterop(Text, { className: 'style' })
cssInterop(Pressable, { className: 'style' })

const menuListStyle = tva({
  base: 'bg-white rounded-2xl overflow-hidden',
})

const menuListItemStyle = tva({
  base: 'flex-row items-center justify-between p-4 bg-white active:bg-greyscale-25',
  variants: {
    hasBorder: {
      true: 'border-b border-greyscale-50',
      false: '',
    },
  },
})

const menuListLeftStyle = tva({
  base: 'flex-row items-center gap-3',
})

const menuListTitleStyle = tva({
  base: 'text-base font-semibold text-greyscale-900',
})

const menuListRightStyle = tva({
  base: 'flex-row items-center gap-2',
})

const menuListValueStyle = tva({
  base: 'text-sm font-medium text-greyscale-500',
})

export type MenuListItemProps = {
  /** Left icon component */
  icon?: React.ReactNode
  /** Main text label */
  title: string
  /** Optional value text or element displayed on the right (e.g., "88 MB" or an Icon) */
  value?: string | React.ReactNode
  /** Callback when item is pressed */
  onPress?: () => void
  /** Show bottom border (used internally by MenuList) */
  hasBorder?: boolean
  /** Custom class name */
  className?: string
  /** Shows right chevron, default true */
  showChevron?: boolean
}

export type MenuListProps = {
  /** Array of MenuListItemProps */
  items: Omit<MenuListItemProps, 'hasBorder'>[]
  /** Custom class name for the container */
  className?: string
}

export const MenuListItem = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  MenuListItemProps
>(
  (
    {
      icon,
      title,
      value,
      onPress,
      hasBorder = false,
      showChevron = true,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Pressable
        ref={ref}
        onPress={onPress}
        className={menuListItemStyle({ hasBorder, class: className })}
        {...props}>
        <View className={menuListLeftStyle({ class: '' })}>
          {icon}
          <Text className={menuListTitleStyle({ class: '' })}>{title}</Text>
        </View>

        <View className={menuListRightStyle({ class: '' })}>
          {value ? (
            typeof value === 'string' ? (
              <Text className={menuListValueStyle({ class: '' })}>{value}</Text>
            ) : (
              value
            )
          ) : null}
          {showChevron &&
            (I18nManager.isRTL ? (
              <ChevronLeft size={20} color="#9E9E9E" />
            ) : (
              <ChevronRight size={20} color="#9E9E9E" />
            ))}
        </View>
      </Pressable>
    )
  },
)

MenuListItem.displayName = 'MenuListItem'

export const MenuList = React.forwardRef<
  React.ComponentRef<typeof View>,
  MenuListProps
>(({ items, className, ...props }, ref) => {
  return (
    <View ref={ref} className={menuListStyle({ class: className })} {...props}>
      {items.map((item, index) => (
        <MenuListItem
          key={index}
          {...item}
          hasBorder={index < items.length - 1} // Add border to all except last item
        />
      ))}
    </View>
  )
})

MenuList.displayName = 'MenuList'
