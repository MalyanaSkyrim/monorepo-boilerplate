// @ts-check
// cspell:ignore colour
// In deploy mode (MOBILE_DEPLOY=1), load tooling/.env with override to ensure
// production values take precedence over the symlinked apps/mobile/.env.
const isDeploy = process.env.MOBILE_DEPLOY === '1';
require('dotenv').config({
  path: isDeploy ? ['../../.env', '../../tooling/.env'] : '../../.env',
  override: isDeploy,
});

/**
 * Reversed iOS client id format required by @react-native-google-signin/google-signin (URL scheme).
 * @param {string} clientId e.g. 123-abc.apps.googleusercontent.com
 * @returns {string | undefined} e.g. com.googleusercontent.apps.123-abc
 */
function googleIosUrlSchemeFromClientId(clientId) {
  if (typeof clientId !== 'string' || clientId.trim().length === 0) {
    return undefined;
  }
  const suffix = '.apps.googleusercontent.com';
  if (!clientId.endsWith(suffix)) {
    return undefined;
  }
  const prefix = clientId.slice(0, -suffix.length);
  if (prefix.length === 0) {
    return undefined;
  }
  return `com.googleusercontent.apps.${prefix}`;
}

// Set EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID to enable Google Sign-In on iOS. Without it the
// Google Sign-In config plugin is skipped so `expo prebuild` still works on a fresh clone.
const googleSignInIosUrlScheme = googleIosUrlSchemeFromClientId(
  process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID
);

// Detect if building for staging environment
const isStaging =
  process.env.APP_ENV === 'staging' ||
  process.env.ENVIRONMENT === 'staging' ||
  process.env.EXPO_PUBLIC_API_AUTH_URL?.includes('staging');

// TODO: replace with your own identifiers before the first native build.
const baseBundleId = process.env.APP_BUNDLE_ID || 'com.example.app';
const bundleId = isStaging ? `${baseBundleId}.staging` : baseBundleId;
const appName = process.env.EXPO_PUBLIC_APP_NAME || 'App Boilerplate';
const displayName = isStaging ? `${appName} (staging)` : appName;
const scheme = isStaging ? 'app-boilerplate-staging' : 'app-boilerplate';

export default {
  /** @type {import("@expo/config").ExpoConfig} */
  expo: {
    name: appName,
    slug: 'app-boilerplate',
    version: '1.0.0',
    scheme: scheme,
    platforms: ['ios', 'android'],
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-font',
      'expo-router',
      ...(googleSignInIosUrlScheme
        ? [
            [
              '@react-native-google-signin/google-signin',
              { iosUrlScheme: googleSignInIosUrlScheme },
            ],
          ]
        : []),
      [
        'expo-build-properties',
        {
          ios: {
            extraPods: [{ name: 'AppCheckCore', version: '11.2.0' }],
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true,
    },
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    assetBundlePatterns: ['**/*'],
    ios: {
      bundleIdentifier: bundleId,
      supportsTablet: true,
      appleTeamId: process.env.APPLE_TEAM_ID,
      infoPlist: {
        CFBundleDisplayName: displayName,
        ITSAppUsesNonExemptEncryption: false,
      },
      entitlements: {
        'com.apple.developer.applesignin': ['Default'],
      },
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      package: bundleId,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundImage: './assets/adaptive-icon-background.png',
        // Single-colour silhouette for Android 13+ themed icons.
        monochromeImage: './assets/monochrome-icon.png',
        backgroundColor: '#3F46F9',
      },
    },
    splash: {
      backgroundColor: '#3F46F9',
      image: './assets/splash.png',
      resizeMode: 'contain',
    },
    extra: {
      // Run `eas init` to link your own EAS project, then set EAS_PROJECT_ID.
      eas: {
        projectId: process.env.EAS_PROJECT_ID,
      },
      storybookEnabled: process.env.STORYBOOK_ENABLED || 'false',
      apiAuthUrl: process.env.EXPO_PUBLIC_API_AUTH_URL || '',
      apiAuthPort: process.env.EXPO_PUBLIC_API_AUTH_PORT || '',
      // Original Google Sign-In: Web client for `GoogleSignin.configure({ webClientId })` + idToken `aud` (see RN docs).
      googleOAuthWebClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_WEB_CLIENT_ID || '',
      googleOAuthIosClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID || '',
      // Android OAuth client in GCP (package + SHA-1); not passed as `webClientId` — keep for docs / future use.
      googleOAuthAndroidClientId: process.env.EXPO_PUBLIC_GOOGLE_OAUTH_ANDROID_CLIENT_ID || '',
      facebookAppId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '',
      appleSignInAndroidServiceId: process.env.EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_SERVICE_ID || '',
      appleSignInAndroidRedirectUri:
        process.env.EXPO_PUBLIC_APPLE_SIGN_IN_ANDROID_REDIRECT_URI || '',
    },
  },
};
