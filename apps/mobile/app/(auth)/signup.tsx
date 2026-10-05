import AuthScreenHeader from '@/components/auth/AuthScreenHeader';
import SignUpFooter from '@/components/auth/SignUpFooter';
import SignUpForm from '@/components/auth/SignUpForm';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { Stack, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignUp() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('auth.signUp.header');

  // Dismiss keyboard when screen loses focus to prevent keyboard flashing
  useFocusEffect(
    useCallback(() => {
      return () => {
        Keyboard.dismiss();
      };
    }, [])
  );

  // Responsive calculations
  const topPadding = Math.max(insets.top, 16);
  const bottomPadding = Math.max(insets.bottom, 24);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'left', 'right']}
      style={{ paddingBottom: bottomPadding + 16 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <AuthScreenHeader
          title={t('title')}
          description={t('subtitle')}
          style={{ marginTop: topPadding }}
        />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            gap: 12,
            paddingBottom: 24,
            paddingHorizontal: 24,
            marginTop: 16,
          }}>
          <SignUpForm />
          <SignUpFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
