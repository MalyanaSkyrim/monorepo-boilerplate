import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { Button, MenuList, MenuListItemProps } from '@app/mobile-ui';
import { useRouter } from 'expo-router';
import { useAtomValue } from 'jotai';
import { FileText, Globe, HelpCircle, Info, Lock, User } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';
import { languageAtom } from '../../lib/store/language';

const ICON_SIZE = 22;
const ICON_COLOR = '#3F46F9'; // Keep improved brand primary color

type MenuSection = {
  title: string;
  items: MenuListItemProps[];
};

export const ProfileMenu = () => {
  const router = useRouter();
  const { signOut } = useAuthContext();
  const { t } = useTranslation('profile.menu');
  const { t: tLang } = useTranslation('profile.language');
  const currentLanguage = useAtomValue(languageAtom);

  const handleLogout = useCallback(async () => {
    await signOut();
    router.replace('/get-started');
  }, [router, signOut]);

  const sections: MenuSection[] = useMemo(() => {
    const getLanguageLabel = (lang: string) => {
      switch (lang) {
        case 'fr':
          return tLang('french');
        case 'ar':
          return tLang('arabic');
        default:
          return tLang('english');
      }
    };

    const generalItems = [
      {
        icon: <User size={ICON_SIZE} color={ICON_COLOR} />,
        title: t('personalInfo'),
        onPress: () => router.push('/profile/personal-data'),
      },
      {
        icon: <Globe size={ICON_SIZE} color={ICON_COLOR} />,
        title: t('language'),
        value: getLanguageLabel(currentLanguage),
        onPress: () => router.push('/profile/language'),
      },
      {
        icon: <HelpCircle size={ICON_SIZE} color={ICON_COLOR} />,
        title: t('helpCenter'),
        onPress: () => router.push('/profile/help-center'),
      },
    ];

    return [
      {
        title: t('general'),
        items: generalItems,
      },
      {
        title: t('legal'),
        items: [
          {
            icon: <Lock size={ICON_SIZE} color={ICON_COLOR} />,
            title: t('privacyPolicy'),
            onPress: () => router.push('/profile/privacy-policy'),
          },
          {
            icon: <FileText size={ICON_SIZE} color={ICON_COLOR} />,
            title: t('termsConditions'),
            onPress: () => router.push('/profile/terms-conditions'),
          },
          {
            icon: <Info size={ICON_SIZE} color={ICON_COLOR} />,
            title: t('aboutApp'),
            onPress: () => console.log('About App'),
          },
        ],
      },
    ];
  }, [currentLanguage, router, t, tLang]);

  return (
    <View className="flex-1 justify-between pb-2">
      <View className="gap-6">
        {sections.map((section, index) => (
          <View key={index}>
            <Text className="mb-2 px-1 text-sm font-semibold uppercase text-greyscale-500">
              {section.title}
            </Text>
            <MenuList items={section.items} />
          </View>
        ))}
      </View>
      <Button variant="destructive" size="lg" label={t('logout')} onPress={handleLogout} />
    </View>
  );
};
