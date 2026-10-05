import type { StorybookConfig } from '@storybook/react-native';

const main: StorybookConfig = {
  stories: ['../../../packages/mobile-ui/src/components/**/*.stories.@(ts|tsx|js|jsx)'],
  addons: [],
};

export default main;
