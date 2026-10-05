import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { brand } from '@app/common';
import React from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Placeholder home screen. Replace it with the first real feature of your app
 * (see docs/NEW_FEATURE_GUIDE.md).
 */
const Home = () => {
  const { profile } = useAuthContext();
  const { t } = useTranslation('home');

  return (
    <SafeAreaView className="flex-1 bg-greyscale-25" edges={['top', 'left', 'right']}>
      <View className="flex-1 justify-center px-6">
        <Text className="text-sm font-medium text-primary-200">{brand.displayName}</Text>
        <Text className="mt-2 text-2xl font-bold text-greyscale-900">
          {t('welcome', { name: profile?.firstName ?? '' })}
        </Text>
        <Text className="mt-3 text-base text-greyscale-500">{t('placeholder')}</Text>
      </View>
    </SafeAreaView>
  );
};

export default Home;
