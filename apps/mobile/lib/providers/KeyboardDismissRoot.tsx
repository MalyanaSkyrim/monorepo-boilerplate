import React, { type ReactNode } from 'react';
import { Keyboard, Pressable } from 'react-native';

type KeyboardDismissRootProps = {
  children: ReactNode;
};

/**
 * Dismisses the keyboard when the user taps non-interactive areas anywhere
 * under this subtree (e.g. screen background). Child buttons, inputs, and
 * scroll views keep their normal touch handling.
 */
export function KeyboardDismissRoot({ children }: KeyboardDismissRootProps) {
  return (
    <Pressable accessible={false} style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      {children}
    </Pressable>
  );
}
