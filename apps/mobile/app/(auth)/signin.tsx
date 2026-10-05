import AuthScreenHeader from '@/components/auth/AuthScreenHeader';
import SignInForm from '@/components/auth/SignInForm';
import SignInOptions from '@/components/auth/SignInOptions';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SignIn() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('auth.signIn.header');

  const topPadding = Math.max(insets.top, 16);
  const bottomPadding = Math.max(insets.bottom, 24);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'left', 'right']}
      style={{ paddingBottom: bottomPadding + 16 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <AuthScreenHeader
        title={t('title')}
        description={t('subtitle')}
        style={{ marginTop: topPadding }}
      />

      <View className="flex-1 gap-y-4 px-6" style={{ marginTop: 16 }}>
        <SignInForm />
        <SignInOptions />
      </View>
    </SafeAreaView>
  );
}
