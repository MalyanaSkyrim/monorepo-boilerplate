import { api } from '@/api';
import { extractErrorMessage } from '@/lib/utils/error';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/lib/validations/auth';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormInput } from '@app/mobile-ui';
import { router } from 'expo-router';
import React from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { toast } from 'sonner-native';

const ForgotPasswordForm = () => {
  const { t } = useTranslation('auth.forgotPassword.form');
  const { t: tRoot } = useTranslation();
  const mutation = api.auth.forgotPassword.useMutation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutation
      .mutateAsync({ email: data.email })
      .then((result) => {
        toast.success(result.message);
        router.push({
          pathname: '/forgot-password/reset',
          params: { email: data.email },
        });
        form.reset();
      })
      .catch((error: unknown) => {
        toast.error(extractErrorMessage(error, undefined, tRoot));
      });
  };

  return (
    <Form form={form} onSubmit={onSubmit}>
      <View className="gap-6">
        <FormInput
          name="email"
          control={form.control}
          label={t('email.label')}
          placeholder={t('email.placeholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          size="lg"
        />

        <Button
          label={t('submit')}
          variant="primary"
          size="lg"
          onPress={form.handleSubmit(onSubmit)}
          isLoading={mutation.isPending}
        />
      </View>
    </Form>
  );
};

export default ForgotPasswordForm;
