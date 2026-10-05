'use client'

import { type ImageProps as ExpoImageProps, Image } from 'expo-image'
import { Image as ImageIcon } from 'lucide-react-native'
import { cssInterop } from 'nativewind'
import React from 'react'
import { View } from 'react-native'

// Apply cssInterop to base components
cssInterop(Image, { className: 'style' })
cssInterop(View, { className: 'style' })

type IUIImageProps = ExpoImageProps & {
  placeholder?: React.ReactNode
  className?: string
}

const DefaultPlaceholder = () => (
  <View className="h-full w-full items-center justify-center bg-gray-100">
    <ImageIcon size={32} color="#9ca3af" />
  </View>
)

const UIImage = React.forwardRef<
  React.ComponentRef<typeof Image>,
  IUIImageProps
>(({ source, placeholder, className, contentFit = 'cover', ...props }, ref) => {
  const wrapperClassName = className
    ? `relative overflow-hidden ${className}`
    : 'relative overflow-hidden'

  // Show placeholder when no source is provided
  if (!source) {
    return (
      <View className={wrapperClassName}>
        {placeholder || <DefaultPlaceholder />}
      </View>
    )
  }

  return (
    <View className={wrapperClassName}>
      {/* Static placeholder underneath — expo-image crossfades over it */}
      <View className="absolute inset-0">
        {placeholder || <DefaultPlaceholder />}
      </View>

      <Image
        ref={ref}
        source={source}
        contentFit={contentFit}
        className="absolute inset-0"
        // Native 300ms crossfade — no React state needed, no flicker on re-renders
        transition={300}
        // recyclingKey prevents view recycling across different URLs in lists
        recyclingKey={
          typeof source === 'object' && 'uri' in source
            ? (source.uri ?? undefined)
            : undefined
        }
        {...props}
      />
    </View>
  )
})

UIImage.displayName = 'UIImage'

export { UIImage }
export type { IUIImageProps }
