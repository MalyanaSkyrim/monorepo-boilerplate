/// <reference types="nativewind/types" />

import type { Preview } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';

const preview: Preview = {
  parameters: {},
  decorators: [
    (Story) => (
      <View className="p-4">
        <Story />
      </View>
    ),
  ],
};

export default preview;
