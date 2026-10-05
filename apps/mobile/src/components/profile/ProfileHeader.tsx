import { UIImage } from '@app/mobile-ui';
import React from 'react';
import { Text, View } from 'react-native';

export type ProfileHeaderProps = {
  name: string;
  email: string;
  avatarUrl?: string | null;
};

export const ProfileHeader = ({ name, email, avatarUrl }: ProfileHeaderProps) => {
  // Use provided avatar or generate one with User Initials using dark slate for high contrast
  const safeAvatarUrl =
    avatarUrl && avatarUrl.trim() !== ''
      ? avatarUrl
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1E293B&color=FFFFFF&bold=true`;

  return (
    <View className="flex-row items-center py-6">
      <UIImage
        source={{ uri: safeAvatarUrl }}
        contentFit="cover"
        className="mr-4 h-14 w-14 rounded-full border border-greyscale-200"
      />
      <View className="flex-1 justify-center">
        <Text className="text-xl font-bold text-greyscale-900">{name}</Text>
        <Text className="text-sm text-greyscale-500">{email}</Text>
      </View>
    </View>
  );
};
