import { api } from '@/api';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { Button, Form, FormInput, FormPhoneInput, UIImage } from '@app/mobile-ui';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Edit2 } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';

import { personalDataSchema, type PersonalDataFormValues } from '@/lib/validations/profile';
import { zodResolver } from '@hookform/resolvers/zod';

export default function PersonalDataScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const { t } = useTranslation('profile.personalData');

  const defaultValues = useMemo(
    () => ({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    }),
    [profile]
  );

  const form = useForm<PersonalDataFormValues>({
    resolver: zodResolver(personalDataSchema),
    defaultValues,
    mode: 'onBlur', // Lazy validation
  });

  const hasHydrated = useRef(false);

  // Hydrate form proactively when profile becomes fully available, ONCE
  useEffect(() => {
    if (profile && !hasHydrated.current) {
      form.reset({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        phone: profile.phone || '',
      });
      hasHydrated.current = true;
    }
  }, [profile, form]);

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : t('userName');

  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);

  const defaultAvatarUrl =
    profile?.avatar && profile.avatar.trim() !== ''
      ? profile.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1E293B&color=FFFFFF&bold=true`;

  const displayAvatarUrl = localAvatarUri || defaultAvatarUrl;

  const handleEditAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalAvatarUri(result.assets[0].uri);
    }
  };

  const updateProfileMutation = api.auth.profile.useMutation();

  const handleSave = async (data: PersonalDataFormValues) => {
    try {
      if (
        data.firstName === profile?.firstName &&
        data.lastName === profile?.lastName &&
        data.email === profile?.email &&
        data.phone === profile?.phone
      ) {
        return; // No changes to save
      }

      await updateProfileMutation.mutateAsync(data);
      toast.success(t('updateSuccess'));
      // Reset form with the new data to make isDirty false again
      form.reset(data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(t('updateError'));
    }
  };

  const isSaveDisabled = !form.formState.isDirty || updateProfileMutation.isPending;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      {/* Header matching booking.tsx */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          className="h-12 w-12 items-center justify-center rounded-full border border-gray-200">
          <ArrowLeft size={24} color="#0D0D12" pointerEvents="none" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-gray-900" numberOfLines={1}>
          {t('title')}
        </Text>
        {/* Placeholder for symmetry like booking.tsx */}
        <View className="h-12 w-12" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          className="px-6 pt-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}>
          {/* Avatar Section */}
          <View className="mb-10 items-center justify-center">
            <View className="relative h-28 w-28">
              <UIImage
                source={{ uri: displayAvatarUrl }}
                contentFit="cover"
                className="h-28 w-28 rounded-full"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 h-8 w-8 items-center justify-center rounded-full bg-primary-300 shadow-sm"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={handleEditAvatar}>
                <Edit2 size={16} color="white" pointerEvents="none" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Container */}
          <View className="flex-1 justify-between">
            <Form form={form} onSubmit={handleSave}>
              <View className="gap-4">
                <FormInput
                  name="firstName"
                  control={form.control}
                  label={t('firstName')}
                  placeholder={t('enterFirstName')}
                  autoCapitalize="words"
                  size="lg"
                />

                <FormInput
                  name="lastName"
                  control={form.control}
                  label={t('lastName')}
                  placeholder={t('enterLastName')}
                  autoCapitalize="words"
                  size="lg"
                />

                <FormInput
                  name="email"
                  control={form.control}
                  label={t('email')}
                  placeholder={t('enterEmail')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  size="lg"
                />

                <FormPhoneInput
                  name="phone"
                  control={form.control}
                  label={t('phone')}
                  placeholder={t('enterPhone')}
                  size="lg"
                  rules={{
                    validate: (value) => !value || value.length >= 10 || t('phoneValidation'),
                  }}
                />
              </View>

              <View className="mt-8">
                <Button
                  label={t('saveChanges')}
                  onPress={form.handleSubmit(handleSave)}
                  variant="primary"
                  size="lg"
                  disabled={isSaveDisabled}
                  isLoading={updateProfileMutation.isPending}
                />
              </View>
            </Form>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
