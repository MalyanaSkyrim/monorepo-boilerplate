import 'react-native-get-random-values';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { GluestackUIProvider } from '@app/mobile-ui';
import '@app/mobile-ui/global.css';

import { AuthProvider, useAuthContext } from '@/lib/contexts/AuthContext';
import { KeyboardDismissRoot } from '@/lib/providers/KeyboardDismissRoot';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { NavigationIndependentTree } from '@react-navigation/native';
import Constants from 'expo-constants';
import { Stack, useRouter, useSegments } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import SplashScreen from '../components/SplashScreen';
import { I18nProvider } from '../src/lib/providers/I18nProvider';
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';

Sentry.init({
  // Leave EXPO_PUBLIC_SENTRY_DSN empty to disable Sentry
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),

  // Set the environment dynamically
  environment: __DEV__ ? 'development' : Updates.channel || 'production',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: __DEV__ ? 0 : 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: __DEV__ ? [] : [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const sentryEnv = __DEV__ ? 'development' : Updates.channel || 'production';
console.log('[App Startup: Sentry] Sentry initialized in', sentryEnv, 'environment');
Sentry.addBreadcrumb({
  category: 'sentry',
  message: 'Sentry initialized',
  level: 'info',
  data: {
    environment: sentryEnv,
    updatesChannel: Updates.channel || null,
  },
});

// Navigation component that uses AuthContext
function NavigationGuard({ onReady }: { onReady?: () => void }) {
  const segments = useSegments();
  const router = useRouter();
  const { isFirstVisit, isAuthenticated, isLoading } = useAuthContext();
  const hasSignaledReady = useRef(false);

  useEffect(() => {
    if (isLoading) {
      console.log('[App Startup: NavigationGuard] Auth states still loading...');
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: 'NavigationGuard evaluation deferred - auth states loading',
        level: 'info',
      });
      return;
    }

    const firstSegment = segments[0];
    const inOnboarding = !firstSegment;
    const currentPath = segments.join('/');

    console.log('[App Startup: NavigationGuard] Evaluating routing:', {
      isLoading,
      isAuthenticated,
      isFirstVisit,
      segments,
      currentPath,
    });
    Sentry.addBreadcrumb({
      category: 'navigation',
      message: 'NavigationGuard evaluating routing',
      level: 'info',
      data: {
        isLoading,
        isAuthenticated,
        isFirstVisit,
        segments,
        currentPath,
      },
    });

    const signalReady = () => {
      if (!hasSignaledReady.current) {
        hasSignaledReady.current = true;
        onReady?.();
      }
    };

    if (isFirstVisit) {
      // First visit - show onboarding screen
      // Allow navigation to get-started and auth routes, but redirect from other routes to onboarding
      if (
        firstSegment &&
        firstSegment !== 'get-started' &&
        firstSegment !== '(auth)' &&
        firstSegment !== 'signin' &&
        firstSegment !== 'signup'
      ) {
        console.log(
          '[App Startup: NavigationGuard] First visit, redirecting from',
          currentPath,
          'to onboard (/)'
        );
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: 'Redirecting to onboard (/)',
          level: 'info',
          data: { currentPath },
        });
        router.replace('/');
      } else {
        console.log(
          '[App Startup: NavigationGuard] First visit, allowed to stay on',
          currentPath || '/'
        );
        signalReady();
      }
      return;
    }

    if (isAuthenticated) {
      // User is authenticated - redirect from auth/get-started/onboarding to home
      const inAuthGroup =
        firstSegment === '(auth)' || firstSegment === 'signin' || firstSegment === 'signup';
      const inGetStarted = firstSegment === 'get-started';

      if (inAuthGroup || inGetStarted || inOnboarding) {
        console.log(
          '[App Startup: NavigationGuard] Authenticated user, redirecting from',
          currentPath || '/',
          'to home (/(home))'
        );
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: 'Redirecting authenticated user to home (/(home))',
          level: 'info',
          data: { currentPath },
        });
        router.replace('/(home)');
      } else {
        console.log(
          '[App Startup: NavigationGuard] Authenticated user, allowed to stay on',
          currentPath
        );
        signalReady();
      }
    } else {
      // User is not authenticated - redirect from home/onboarding to get-started
      const inHomeGroup = firstSegment === '(home)';

      if (inHomeGroup || inOnboarding) {
        console.log(
          '[App Startup: NavigationGuard] Unauthenticated user, redirecting from',
          currentPath || '/',
          'to get-started'
        );
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: 'Redirecting unauthenticated user to get-started',
          level: 'info',
          data: { currentPath },
        });
        router.replace('/get-started');
      } else {
        console.log(
          '[App Startup: NavigationGuard] Unauthenticated user, allowed to stay on',
          currentPath
        );
        signalReady();
      }
    }
  }, [isFirstVisit, isAuthenticated, isLoading, segments, router, onReady]);

  return null;
}

// App content component that handles splash screen and routing coordination
function AppContent() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [isNavReady, setIsNavReady] = useState(false);
  const { isLoading: isAuthLoading } = useAuthContext();

  // Safety fallback: if navigation takes > 1.5s, unblock splash screen so app never hangs
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsNavReady(true);
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  const handleNavReady = useCallback(() => {
    setIsNavReady(true);
  }, []);

  const handleSplashFinish = () => {
    console.log('[App Startup: AppContent] Splash screen finished animating');
    Sentry.addBreadcrumb({
      category: 'lifecycle',
      message: 'Splash screen finished',
      level: 'info',
    });
    setIsSplashVisible(false);
  };

  // Only consider app ready when auth is loaded AND destination route is confirmed
  const isAppReady = !isAuthLoading && isNavReady;
  const showSplash = isSplashVisible || !isAppReady;

  return (
    <>
      <NavigationGuard onReady={handleNavReady} />
      <View style={{ flex: 1 }}>
        <KeyboardDismissRoot>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: '#FFFFFF',
              },
            }}>
            {/* Onboarding screen - shown on first visit */}
            <Stack.Screen name="index" />

            {/* Get started screen - shown when not authenticated (not first visit) */}
            <Stack.Screen name="get-started" />

            {/* Auth screens - accessible when not logged in */}
            <Stack.Screen name="(auth)" />

            {/* Protected tabs - accessible when logged in */}
            <Stack.Screen name="(home)" />

            {/* Register your own stack screens here as the app grows */}
          </Stack>
        </KeyboardDismissRoot>
        {showSplash && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}>
            <SplashScreen onFinish={handleSplashFinish} isLoading={!isAppReady} />
          </View>
        )}
      </View>
    </>
  );
}

export default Sentry.wrap(function Layout() {
  const isStorybookEnabled = Constants.expoConfig?.extra?.storybookEnabled === 'true';

  useEffect(() => {
    console.log(
      '[App Startup: Layout] Root Layout mounted. Storybook enabled:',
      isStorybookEnabled
    );
    Sentry.addBreadcrumb({
      category: 'lifecycle',
      message: 'Root Layout mounted',
      level: 'info',
      data: { isStorybookEnabled },
    });
  }, [isStorybookEnabled]);

  // Storybook mode
  if (isStorybookEnabled) {
    return (
      <NavigationIndependentTree>
        <KeyboardDismissRoot>
          <Stack />
        </KeyboardDismissRoot>
      </NavigationIndependentTree>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <GluestackUIProvider>
          <QueryProvider>
            <AuthProvider>
              <BottomSheetModalProvider>
                <AppContent />
                <Toaster />
              </BottomSheetModalProvider>
            </AuthProvider>
          </QueryProvider>
        </GluestackUIProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
});
