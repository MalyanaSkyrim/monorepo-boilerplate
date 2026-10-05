import { OverlayProvider } from '@gluestack-ui/core/overlay/creator'
import { ToastProvider } from '@gluestack-ui/core/toast/creator'
import { useColorScheme } from 'nativewind'
import React, { useMemo } from 'react'
import { View, ViewProps } from 'react-native'

import { config } from './config'

export type ModeType = 'light' | 'dark' | 'system'

export function GluestackUIProvider({
  mode = 'system',
  ...props
}: {
  mode?: ModeType
  children?: React.ReactNode
  style?: ViewProps['style']
}) {
  const systemColorScheme = useColorScheme()

  // Determine the active color scheme
  const activeColorScheme = useMemo(() => {
    if (mode === 'system' || !mode) {
      return systemColorScheme.colorScheme || 'light'
    }
    return mode
  }, [mode, systemColorScheme.colorScheme])

  return (
    <View
      style={[
        config[activeColorScheme],
        { flex: 1, height: '100%', width: '100%' },
        props.style,
      ]}>
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  )
}
