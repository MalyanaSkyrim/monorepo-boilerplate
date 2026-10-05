import { api } from '@/api';
import { extractErrorMessage } from '@/lib/utils/error';
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/lib/validations/auth';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormInput } from '@app/mobile-ui';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import ResetPasswordConfirmation from './ResetPasswordConfirmation';

type ResetPasswordFormProps = {
  email: string;
};

const ResetPasswordForm = ({ email }: ResetPasswordFormProps) => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { t } = useTranslation('auth.resetPassword.form');
  const mutation = api.auth.resetPassword.useMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    mutation
      .mutateAsync({
        email,
        code: data.code,
        password: data.password,
      })
      .then(() => {
        setIsConfirmationOpen(true);
      })
      .catch((error: unknown) => {
        toast.error(extractErrorMessage(error));
      });
  };

  const navigateToSignIn = () => {
    router.replace('/signin');
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <View className="flex-1 justify-between">
        <View className="gap-4">
          <FormInput
            name="code"
            control={form.control}
            label={t('code.label')}
            placeholder={t('code.placeholder')}
            keyboardType="number-pad"
            autoCapitalize="none"
            autoComplete="off"
            maxLength={6}
            size="lg"
          />

          <FormInput
            name="password"
            control={form.control}
            label={t('password.label')}
            placeholder={t('password.placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            enablePasswordToggle={true}
            size="lg"
          />

          <FormInput
            name="confirmPassword"
            control={form.control}
            label={t('confirmPassword.label')}
            placeholder={t('confirmPassword.placeholder')}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            enablePasswordToggle={true}
            size="lg"
          />
        </View>

        <View className="pb-6">
          <Button
            label={t('submit')}
            variant="primary"
            size="lg"
            onPress={form.handleSubmit(onSubmit)}
            isLoading={mutation.isPending}
          />
        </View>
      </View>
      <ResetPasswordConfirmation
        isOpen={isConfirmationOpen}
        onOpenChange={setIsConfirmationOpen}
        onConfirm={navigateToSignIn}
      />
    </Form>
  );
};

export default ResetPasswordForm;
