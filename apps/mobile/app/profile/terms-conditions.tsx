import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TermsConditionsScreen() {
  const router = useRouter();
  const { t } = useTranslation('profile.terms');

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
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
        <View className="h-12 w-12" />
      </View>

      <ScrollView
        className="px-6 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <Text className="text-base leading-6 text-gray-600">{t('content')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
