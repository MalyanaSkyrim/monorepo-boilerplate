import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { ProfileHeader } from '../../src/components/profile/ProfileHeader';
import { ProfileMenu } from '../../src/components/profile/ProfileMenu';

const Profile = () => {
  const { profile } = useAuthContext();
  const { t } = useTranslation('profile.personalData');

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : t('userName');
  const email = profile?.email ?? '';
  const avatarUrl = profile?.avatar ?? '';

  return (
    <ScrollView
      className="flex-1 bg-greyscale-50 pt-10"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}>
      <View className="flex-1 px-5">
        <ProfileHeader name={fullName} email={email} avatarUrl={avatarUrl} />
        <ProfileMenu />
      </View>
    </ScrollView>
  );
};

export default Profile;
