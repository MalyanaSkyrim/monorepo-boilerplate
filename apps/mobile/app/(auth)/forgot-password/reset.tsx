import AuthScreenHeader from '@/components/auth/AuthScreenHeader';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { normalizeStringParam } from '@/lib/utils/params';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ResetPassword() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string | string[] }>();
  const email = normalizeStringParam(params.email);
  const { t } = useTranslation('auth.resetPassword.header');
  const { t: tMissing } = useTranslation('auth.resetPassword.missingEmail');
  const bottomPadding = Math.max(insets.bottom, 24);

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={['top', 'left', 'right']}
      style={{ paddingBottom: bottomPadding + 16 }}>
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between px-6 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full border border-gray-200">
          <ArrowLeft size={24} color="#0D0D12" pointerEvents="none" />
        </TouchableOpacity>
        <View className="flex-1" />
        <View className="h-12 w-12" />
      </View>

      {email === undefined ? (
        <>
          <AuthScreenHeader
            title={t('title')}
            description={tMissing('description')}
            style={{ marginTop: 8 }}
          />
          <View className="flex-1 px-6" style={{ marginTop: 16 }}>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text className="text-base font-semibold text-error-100">
                {tMissing('requestLink')}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <AuthScreenHeader
            title={t('title')}
            description={t('subtitle')}
            style={{ marginTop: 8 }}
          />
          <View className="flex-1 px-6" style={{ marginTop: 16 }}>
            <ResetPasswordForm email={email} />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
