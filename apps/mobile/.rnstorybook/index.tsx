import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { GluestackUIProvider } from '@app/mobile-ui';
import '@app/mobile-ui/global.css';
import React from 'react';
import { view } from './storybook.requires';

const StorybookUIRoot = view.getStorybookUI({
  storage: {
    getItem: AsyncStorage.getItem,
    setItem: AsyncStorage.setItem,
  },
});

// Wrap Storybook with GluestackUIProvider
// NavigationContainer is provided by Slot in _layout.tsx (wrapped in NavigationIndependentTree)
const StorybookWrapper = () => {
  return (
    <NavigationContainer>
      <GluestackUIProvider>
        <StorybookUIRoot />
      </GluestackUIProvider>
    </NavigationContainer>
  );
};

export default StorybookWrapper;
