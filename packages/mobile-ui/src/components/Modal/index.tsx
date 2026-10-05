'use client'

import { createModal } from '@gluestack-ui/core/modal/creator'
import type { VariantProps } from '@gluestack-ui/utils/nativewind-utils'
import { tva, withStyleContext } from '@gluestack-ui/utils/nativewind-utils'
import {
  AnimatePresence,
  createMotionAnimatedComponent,
  Motion,
  MotionComponentProps,
} from '@legendapp/motion'
import { cssInterop } from 'nativewind'
import React from 'react'
import { Pressable, ScrollView, View, ViewStyle } from 'react-native'

type IAnimatedPressableProps = React.ComponentProps<typeof Pressable> &
  MotionComponentProps<typeof Pressable, ViewStyle, unknown, unknown, unknown>

const AnimatedPressable = createMotionAnimatedComponent(
  Pressable,
) as React.ComponentType<IAnimatedPressableProps>

const SCOPE = 'MODAL'

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>

const UIModal = createModal({
  Root: withStyleContext(View, SCOPE),
  Backdrop: AnimatedPressable,
  Content: MotionView,
  Body: ScrollView,
  CloseButton: Pressable,
  Footer: View,
  Header: View,
  AnimatePresence: AnimatePresence,
})

cssInterop(AnimatedPressable, { className: 'style' })
cssInterop(MotionView, { className: 'style' })

const modalStyle = tva({
  base: 'group/modal w-full h-full justify-center items-center web:pointer-events-none',
  variants: {
    size: {
      xs: '',
      sm: '',
      md: '',
      lg: '',
      full: '',
    },
  },
})

const modalBackdropStyle = tva({
  base: 'absolute left-0 top-0 right-0 bottom-0 bg-background-dark web:cursor-default',
})

const modalContentStyle = tva({
  base: 'bg-background-0 rounded-2xl overflow-hidden border border-outline-100 shadow-hard-2 p-6',
  parentVariants: {
    size: {
      xs: 'w-[60%] max-w-[360px]',
      sm: 'w-[70%] max-w-[420px]',
      md: 'w-[80%] max-w-[510px]',
      lg: 'w-[90%] max-w-[640px]',
      full: 'w-full',
    },
  },
})

const modalCloseButtonStyle = tva({
  base: 'group/modal-close-button z-10 rounded data-[focus-visible=true]:web:bg-background-100 web:outline-0 cursor-pointer',
})

const modalHeaderStyle = tva({
  base: 'justify-between items-center flex-row mb-4',
})

const modalFooterStyle = tva({
  base: 'flex-row justify-end items-center gap-2 mt-6',
})

export interface ModalProps extends VariantProps<typeof modalStyle> {
  // Root Modal Props
  isOpen?: boolean
  onClose?: () => void
  className?: string
  closeOnBackdropClick?: boolean

  // Backdrop Props
  backdrop?: {
    show?: boolean
    className?: string
    onPress?: () => void
  } & Partial<React.ComponentProps<typeof UIModal.Backdrop>>

  // Content Props
  content?: {
    className?: string
  } & Partial<React.ComponentProps<typeof UIModal.Content>>

  // Header Props
  header?: {
    show?: boolean
    className?: string
    children?: React.ReactNode
  } & Partial<React.ComponentProps<typeof UIModal.Header>>

  // Body Props
  body?: {
    className?: string
    children?: React.ReactNode
  } & Partial<React.ComponentProps<typeof UIModal.Body>>

  // Footer Props
  footer?: {
    show?: boolean
    className?: string
    children?: React.ReactNode
  } & Partial<React.ComponentProps<typeof UIModal.Footer>>

  // Close Button Props
  closeButton?: {
    show?: boolean
    className?: string
    children?: React.ReactNode
    onPress?: () => void
  } & Partial<React.ComponentProps<typeof UIModal.CloseButton>>

  // Children (rendered in body by default)
  children?: React.ReactNode
}

export const Modal = React.forwardRef<
  React.ComponentRef<typeof UIModal>,
  ModalProps
>(
  (
    {
      className,
      size = 'md',
      isOpen = false,
      onClose,
      closeOnBackdropClick = true,
      backdrop,
      content,
      header,
      body,
      footer,
      closeButton,
      children,
      ...props
    },
    ref,
  ) => {
    const {
      show: showBackdrop = true,
      className: backdropClassName,
      onPress: backdropOnPress,
      ...backdropProps
    } = backdrop || {}

    const { className: contentClassName, ...contentProps } = content || {}

    const {
      show: showHeader = false,
      className: headerClassName,
      children: headerChildren,
      ...headerProps
    } = header || {}

    const {
      className: bodyClassName,
      children: bodyChildren,
      ...bodyProps
    } = body || {}

    const {
      show: showFooter = false,
      className: footerClassName,
      children: footerChildren,
      ...footerProps
    } = footer || {}

    const {
      show: showCloseButton = false,
      className: closeButtonClassName,
      children: closeButtonChildren,
      onPress: closeButtonOnPress,
      ...closeButtonProps
    } = closeButton || {}

    const handleBackdropPress = React.useCallback(() => {
      if (closeOnBackdropClick && onClose) {
        onClose()
      }
      if (backdropOnPress) {
        backdropOnPress()
      }
    }, [closeOnBackdropClick, backdropOnPress, onClose])

    return (
      <UIModal
        ref={ref}
        isOpen={isOpen}
        onClose={onClose}
        {...props}
        pointerEvents="box-none"
        className={modalStyle({ size, class: className })}
        context={{ size }}>
        {showBackdrop && (
          <UIModal.Backdrop
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 0.6,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              type: 'spring',
              damping: 18,
              stiffness: 250,
              opacity: {
                type: 'timing',
                duration: 250,
              },
            }}
            onPress={handleBackdropPress}
            {...backdropProps}
            className={modalBackdropStyle({
              class: backdropClassName,
            })}></UIModal.Backdrop>
        )}

        <UIModal.Content
          initial={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            type: 'spring',
            damping: 18,
            stiffness: 250,
            opacity: {
              type: 'timing',
              duration: 250,
            },
          }}
          {...contentProps}
          className={modalContentStyle({
            parentVariants: {
              size,
            },
            class: contentClassName,
          })}
          pointerEvents="auto">
          {(showHeader || headerChildren) && (
            <UIModal.Header
              {...headerProps}
              className={modalHeaderStyle({
                class: headerClassName,
              })}>
              {headerChildren}
              {showCloseButton && (
                <UIModal.CloseButton
                  onPress={closeButtonOnPress || onClose}
                  {...closeButtonProps}
                  className={modalCloseButtonStyle({
                    class: closeButtonClassName,
                  })}>
                  {closeButtonChildren}
                </UIModal.CloseButton>
              )}
            </UIModal.Header>
          )}

          <UIModal.Body {...bodyProps} className={bodyClassName}>
            {bodyChildren || children}
          </UIModal.Body>

          {(showFooter || footerChildren) && (
            <UIModal.Footer
              {...footerProps}
              className={modalFooterStyle({
                class: footerClassName,
              })}>
              {footerChildren}
            </UIModal.Footer>
          )}
        </UIModal.Content>
      </UIModal>
    )
  },
)

Modal.displayName = 'Modal'
