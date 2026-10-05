import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import React, { forwardRef, useCallback, useEffect, useRef } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type BottomSheetProps = {
  isOpen?: boolean
  onClose?: () => void
  snapPoints?: string[]
  children: React.ReactNode
  enablePanDownToClose?: boolean
  scrollable?: boolean
  footer?: React.ReactNode
  enableDynamicSizing?: boolean
  bounces?: boolean
  contentStyle?: StyleProp<ViewStyle>
}

export const BottomSheet = forwardRef<BottomSheetModal, BottomSheetProps>(
  (
    {
      isOpen,
      onClose,
      snapPoints = ['50%'],
      children,
      enablePanDownToClose = true,
      scrollable,
      footer,
      enableDynamicSizing = false,
      bounces = false,
      contentStyle,
    },
    ref,
  ) => {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null)
    const insets = useSafeAreaInsets()

    // Sync external ref if provided
    React.useImperativeHandle(
      ref,
      () => bottomSheetModalRef.current as BottomSheetModal,
    )

    useEffect(() => {
      if (isOpen) {
        bottomSheetModalRef.current?.present()
      } else {
        bottomSheetModalRef.current?.dismiss()
      }
    }, [isOpen])

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      [],
    )

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={enableDynamicSizing ? undefined : snapPoints}
        enableDynamicSizing={enableDynamicSizing}
        enablePanDownToClose={enablePanDownToClose}
        backdropComponent={renderBackdrop}
        onDismiss={onClose}
        handleIndicatorStyle={{ backgroundColor: '#e5e7eb', width: 40 }}>
        {scrollable ? (
          <View
            style={[{ flex: 1, padding: 24, paddingBottom: 0 }, contentStyle]}>
            <BottomSheetScrollView
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              bounces={bounces}
              overScrollMode="never">
              {children}
            </BottomSheetScrollView>
            {footer && (
              <View
                style={{ paddingTop: 16, paddingBottom: 24 + insets.bottom }}>
                {footer}
              </View>
            )}
          </View>
        ) : (
          <BottomSheetView style={[{ flex: 1, padding: 24 }, contentStyle]}>
            {children}
            {footer && (
              <View style={{ paddingTop: 16, paddingBottom: insets.bottom }}>
                {footer}
              </View>
            )}
          </BottomSheetView>
        )}
      </BottomSheetModal>
    )
  },
)

BottomSheet.displayName = 'BottomSheet'
