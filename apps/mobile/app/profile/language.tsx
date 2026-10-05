import { MenuList } from '@app/mobile-ui';
import { Stack, useRouter } from 'expo-router';

import { useAtom } from 'jotai';
import { ArrowLeft, Check } from 'lucide-react-native';
import React from 'react';

import type { TranslationKey } from '@/src/lib/hooks/useTranslation';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import * as Updates from 'expo-updates';
import { DevSettings, I18nManager, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { languageAtom } from '../../src/lib/store/language';

type LanguageOption = {
  id: string;
  nameKey: TranslationKey;
  shortCode: string;
  isRtl?: boolean;
};

const LANGUAGES: LanguageOption[] = [
  { id: 'en', nameKey: 'profile.language.english', shortCode: 'EN', isRtl: false },
  { id: 'fr', nameKey: 'profile.language.french', shortCode: 'FR', isRtl: false },
  { id: 'ar', nameKey: 'profile.language.arabic', shortCode: 'AR', isRtl: true },
];

export default function LanguageScreen() {
  const [currentLanguage, setLanguage] = useAtom(languageAtom);
  const { t } = useTranslation('profile.language');
  const { t: tFull } = useTranslation();
  const router = useRouter();

  const handleLanguageSelect = async (lang: LanguageOption) => {
    setLanguage(lang.id);
    const isCurrentlyRtl = I18nManager.isRTL;

    // No change needed
    if (lang.isRtl === isCurrentlyRtl) {
      router.back();
      return;
    }

    // Change RTL setting
    I18nManager.forceRTL(!!lang.isRtl);

    // Reload safely depending on environment
    if (__DEV__) {
      DevSettings.reload();
    } else {
      await Updates.reloadAsync();
    }
  };

  const menuItems = LANGUAGES.map((lang) => ({
    icon: (
      <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-25">
        <Text className="text-primary-500 text-xs font-bold">{lang.shortCode}</Text>
      </View>
    ),
    title: tFull(lang.nameKey),
    value: currentLanguage === lang.id ? <Check size={20} color="#3D5CFF" /> : undefined,
    showChevron: false,
    onPress: () => handleLanguageSelect(lang),
  }));

  return (
    <SafeAreaView className="flex-1 bg-greyscale-50" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-12 w-12 items-center justify-center rounded-full border border-gray-200">
          <ArrowLeft size={24} color="#0D0D12" pointerEvents="none" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900" numberOfLines={1}>
          {t('title')}
        </Text>
        {/* Placeholder for symmetry */}
        <View className="h-12 w-12" />
      </View>

      <View className="flex-1 px-5 pt-2">
        <MenuList items={menuItems} />
      </View>
    </SafeAreaView>
  );
}
