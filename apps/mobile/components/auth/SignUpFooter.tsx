import { useTranslation } from '@/src/lib/hooks/useTranslation';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

const SignUpFooter = () => {
  const { t } = useTranslation('auth.signUp.footer');
  const handleTermsPress = () => {
    // TODO: Navigate to Terms & Conditions
    console.log('Navigate to Terms & Conditions');
  };

  const handlePrivacyPress = () => {
    // TODO: Navigate to Privacy Policy
    console.log('Navigate to Privacy Policy');
  };

  return (
    <View className="mt-2 items-center">
      {/* Terms Text */}
      <View className="gap-2">
        <Text className="h-4 text-center text-sm text-greyscale-400">{t('agreeTo')}</Text>
        <View className="flex-row flex-wrap justify-center">
          <Pressable onPress={handleTermsPress}>
            <Text className="text-sm font-semibold text-primary-300">{t('terms')}</Text>
          </Pressable>
          <Text className="text-sm text-greyscale-400">{t('and')}</Text>
          <Pressable onPress={handlePrivacyPress}>
            <Text className="text-sm font-semibold text-primary-300">{t('privacy')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default SignUpFooter;
