import { brand } from '@app/common';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { AppLogo, APP_LOGO_DEFAULT_COLOR } from '@app/mobile-ui/icons';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone } from 'lucide-react-native';
import React, { useCallback } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LOGO_SIZE = 64;
const ICON_SIZE = 22;
const ICON_COLOR = '#656BFA';

export default function HelpCenterScreen() {
  const router = useRouter();
  const { t } = useTranslation('profile.helpCenter');

  const openMail = useCallback(() => {
    const email = t('supportEmail');
    Linking.openURL(`mailto:${email}`).catch(() => undefined);
  }, [t]);

  const openPhone = useCallback(() => {
    const raw = t('supportPhoneHref');
    const tel = raw.replace(/\s/g, '');
    Linking.openURL(`tel:${tel}`).catch(() => undefined);
  }, [t]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full border border-gray-200">
          <ArrowLeft size={24} color="#0D0D12" pointerEvents="none" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900" numberOfLines={1}>
          {t('title')}
        </Text>
        <View className="h-12 w-12" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-10 items-center">
          <AppLogo size={LOGO_SIZE} color={APP_LOGO_DEFAULT_COLOR} />
          <Text className="mt-4 text-center text-xl font-semibold text-primary-300">
            {brand.displayName}
          </Text>
        </View>

        <Text className="mb-8 text-center text-base leading-6 text-gray-600">{t('intro')}</Text>

        <TouchableOpacity
          onPress={openMail}
          accessibilityRole="link"
          accessibilityLabel={t('emailA11y')}
          className="mb-4 flex-row items-center gap-4 rounded-xl border border-gray-100 bg-greyscale-50 px-4 py-4">
          <Mail size={ICON_SIZE} color={ICON_COLOR} />
          <Text className="flex-1 text-base font-medium text-gray-900">{t('supportEmail')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openPhone}
          accessibilityRole="link"
          accessibilityLabel={t('phoneA11y')}
          className="flex-row items-center gap-4 rounded-xl border border-gray-100 bg-greyscale-50 px-4 py-4">
          <Phone size={ICON_SIZE} color={ICON_COLOR} />
          <Text className="flex-1 text-base font-medium text-gray-900">
            {t('supportPhoneDisplay')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
