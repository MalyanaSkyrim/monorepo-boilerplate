import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { brand } from '@app/common';
import { Button } from '@app/mobile-ui';
import { AppLogo } from '@app/mobile-ui/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ImageBackground, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GetStarted() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { setFirstVisit } = useAuthContext();
  const { t } = useTranslation('auth.getStarted');

  // Mark first visit as complete when user reaches get-started screen
  useEffect(() => {
    setFirstVisit(false).catch((error) => {
      console.error('Error setting first visit complete:', error);
    });
  }, [setFirstVisit]);

  // Responsive spacing
  const bottomPadding = Math.max(insets.bottom, 24);
  const contentSpacing = Math.min(height * 0.055, 44);
  // SafeAreaView already applies top inset; small gap below status bar
  const brandTopPadding = 12;
  const logoSize = Math.min(width * 0.22, 88);
  const wordmarkSize = Math.min(width * 0.072, 30);

  const handleGetStarted = () => {
    // Navigate to sign up
    router.push({ pathname: '/signup' });
  };

  const handleSignIn = () => {
    // Navigate to sign in screen
    router.push({ pathname: '/signin' });
  };

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top', 'left', 'right']}>
      <Stack.Screen options={{ headerShown: false }} />

      <ImageBackground
        source={require('../assets/get-started.png')} // Replace with actual background image
        className="flex-1"
        resizeMode="cover">
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,1)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Content Container - Ensure it sits on top of the absolute gradient */}
        <View className="z-10 flex-1">
          <View
            accessibilityRole="header"
            accessibilityLabel={brand.displayName}
            className="flex-1 items-center justify-center px-6"
            style={{ paddingTop: brandTopPadding }}>
            <View
              style={{
                width: logoSize,
                height: logoSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AppLogo size={logoSize} color="#FFFFFF" />
            </View>
            <Text
              className="mt-3 text-center font-bold text-white"
              style={{
                fontSize: wordmarkSize,
                letterSpacing: 0.6,
                textShadowColor: 'rgba(0,0,0,0.45)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 6,
              }}>
              {brand.displayName}
            </Text>
          </View>

          <View className="flex-1 justify-end" style={{ paddingBottom: bottomPadding + 16 }}>
            {/* Text Content */}
            <View className="px-6" style={{ marginBottom: contentSpacing }}>
              <Text
                className="mb-4 text-center font-bold text-white"
                style={{
                  fontSize: Math.min(width * 0.064, 24),
                  lineHeight: Math.min(width * 0.096, 36),
                }}>
                {t('title')}
              </Text>
              <Text
                className="self-center text-center text-sm font-normal text-greyscale-400"
                style={{
                  lineHeight: 22,
                  maxWidth: width * 0.85,
                }}>
                {t('subtitle')}
              </Text>
            </View>

            {/* Get Started Button */}
            <View className="mb-4 w-full px-6">
              <Button
                className="w-full"
                label={t('button')}
                size="lg"
                variant="primary"
                onPress={handleGetStarted}
              />
            </View>

            {/* Sign In Link */}
            <View className="mb-2 flex-row items-center justify-center gap-1">
              <Text className="text-center text-sm font-normal text-greyscale-400">
                {t('alreadyHaveAccount')}
              </Text>
              <Button label={t('signIn')} variant="link" size="sm" onPress={handleSignIn} />
            </View>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}
