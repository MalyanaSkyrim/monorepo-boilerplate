const { withNativeWind } = require('nativewind/metro');
const withStorybook = require('@storybook/react-native/metro/withStorybook');
const path = require('path');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getSentryExpoConfig(__dirname);

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Keep Expo's workspace watch folders (they include the repo-root `node_modules` entry).
// Replacing them with only [projectRoot, monorepoRoot] drops that entry: hoisted deps such
// as `expo-router` then fail `fileSystemLookup` and deep imports like
// `expo-router/build/qualified-entry` cannot resolve.
config.watchFolders = [...new Set([...(config.watchFolders ?? []), projectRoot, monorepoRoot])];

config.resolver.disableHierarchicalLookup = true;

config.resolver.extraNodeModules = {
  '@app/http-client': path.resolve(monorepoRoot, 'packages/http-client/src'),
  '@app/common': path.resolve(monorepoRoot, 'packages/common/src'),
  '@app/mobile-ui': path.resolve(monorepoRoot, 'packages/mobile-ui/src'),
};

config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /node_modules\/prettier-plugin-tailwindcss\/.*/,
  /node_modules\/prisma-json-types-generator\/.*/,
  /node_modules\/prisma\/.*/,
  /node_modules\/@prisma\/.*/,
  /node_modules\/eslint\/.*/,
  /node_modules\/@eslint\/.*/,
  /node_modules\/prettier\/.*/,
  // Prevent Metro from resolving into sibling projects (e.g. web-workshop)
  /[\\/]web-workshop[\\/].*/,
];

module.exports = withStorybook(
  withNativeWind(config, { input: '../../packages/mobile-ui/global.css', inlineRem: 16 }),
  {
    enabled: process.env.STORYBOOK_ENABLED === 'true',
  }
);
