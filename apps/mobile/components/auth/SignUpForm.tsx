import { api } from '@/api';
import { extractErrorMessage } from '@/lib/utils/error';
import { signUpSchema, type SignUpFormValues } from '@/lib/validations/auth';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormInput, FormPhoneInput } from '@app/mobile-ui';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

const SignUpForm = () => {
  const { t } = useTranslation('auth.signUp.form');
  const { t: tFooter } = useTranslation('auth.signUp.footer');

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const mutation = api.auth.signup.useMutation();

  const handleSignUp = (data: SignUpFormValues) => {
    mutation
      .mutateAsync(data)
      .then(() => {
        form.reset();
        // The account exists but is unverified; the code is already on its way.
        router.push({ pathname: '/verify-email', params: { email: data.email } });
      })
      .catch((error) => {
        const errorMessage = extractErrorMessage(error);
        toast.error(errorMessage);
      });
  };

  return (
    <>
      <Form form={form} onSubmit={handleSignUp}>
        <View>
          <View className="gap-3">
            <FormInput
              name="firstName"
              control={form.control}
              label={t('firstName.label')}
              placeholder={t('firstName.placeholder')}
              autoCapitalize="words"
              autoCorrect={false}
              size="lg"
            />

            <FormInput
              name="lastName"
              control={form.control}
              label={t('lastName.label')}
              placeholder={t('lastName.placeholder')}
              autoCapitalize="words"
              autoCorrect={false}
              size="lg"
            />

            <FormInput
              name="email"
              control={form.control}
              label={t('email.label')}
              placeholder={t('email.placeholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              size="lg"
            />

            <FormPhoneInput
              name="phone"
              control={form.control}
              label={t('phone.label')}
              placeholder={t('phone.placeholder')}
              size="lg"
            />

            <FormInput
              name="password"
              control={form.control}
              label={t('password.label')}
              placeholder={t('password.placeholder')}
              secureTextEntry={true}
              enablePasswordToggle={true}
              autoCapitalize="none"
              autoCorrect={false}
              size="lg"
            />
          </View>

          <View className="mt-6 gap-4">
            <Button
              label={t('submit')}
              size="lg"
              variant="primary"
              onPress={form.handleSubmit(handleSignUp)}
              disabled={!form.formState.isValid || mutation.isPending}
              isLoading={mutation.isPending}
            />

            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-center text-sm text-greyscale-400">
                {tFooter('alreadyHaveAccount')}
              </Text>
              <Pressable onPress={() => router.push('/signin')}>
                <Text className="text-sm font-semibold text-primary-300">{tFooter('signIn')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Form>
    </>
  );
};

export default SignUpForm;
