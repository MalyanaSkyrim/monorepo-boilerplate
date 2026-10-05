import { brand } from '@app/common';
import { AppLogo, APP_LOGO_DEFAULT_COLOR } from '@app/mobile-ui/icons';
import React from 'react';
import { StyleProp, Text, View, ViewStyle } from 'react-native';

const LOGO_SIZE = 32;

const AuthScreenHeader = ({
  title,
  description,
  style,
}: {
  title: string;
  description: string;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <View className="px-6" style={style}>
      <View
        accessibilityRole="header"
        accessibilityLabel={brand.displayName}
        className="mb-6 w-full flex-row items-center justify-start gap-2">
        <AppLogo size={LOGO_SIZE} color={APP_LOGO_DEFAULT_COLOR} />
        <Text className="text-lg font-semibold text-primary-300">{brand.displayName}</Text>
      </View>
      <Text className="mb-1.5 text-2xl font-bold text-greyscale-900">{title}</Text>
      <Text className="text-sm text-greyscale-400">{description}</Text>
    </View>
  );
};

export default AuthScreenHeader;
