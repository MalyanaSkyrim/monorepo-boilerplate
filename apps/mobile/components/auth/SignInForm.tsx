import { api } from '@/api';
import { extractErrorMessage, getErrorCode } from '@/lib/utils/error';
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormInput } from '@app/mobile-ui';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import { toast } from 'sonner-native';

const SignInForm = () => {
  const { t } = useTranslation('auth.signIn.form');
  const { t: tRoot } = useTranslation();
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const mutation = api.auth.signin.useMutation();
  const resendMutation = api.auth.sendVerificationCode.useMutation();

  const handleSignIn = (data: SignInFormValues) => {
    mutation.mutate(data);
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  // Handle error notifications
  useEffect(() => {
    if (!mutation.error) return;

    // An account that never finished verification: send a fresh code, then drop
    // the user into the OTP flow. Only navigate once the send succeeds, so the
    // OTP screen's "we've sent a code" is always true; on failure (rate limit,
    // mail outage) explain why and leave them here to retry.
    if (getErrorCode(mutation.error) === 'EMAIL_NOT_VERIFIED') {
      const email = form.getValues('email');
      resendMutation
        .mutateAsync({ email })
        .then(() => {
          router.push({ pathname: '/verify-email', params: { email } });
        })
        .catch((error: unknown) => {
          toast.error(extractErrorMessage(error, undefined, tRoot));
        });
      return;
    }

    toast.error(extractErrorMessage(mutation.error, undefined, tRoot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutation.error]);

  return (
    <Form form={form} onSubmit={handleSignIn}>
      <View className="flex-1 justify-between">
        <View>
          <View className="gap-4">
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
          <Button
            label={t('forgotPassword')}
            variant="tertiary"
            size="sm"
            onPress={handleForgotPassword}
            className="mt-2 self-end">
            <Text className="font-semibold text-error-100">{t('forgotPassword')}</Text>
          </Button>
        </View>
        <Button
          label={t('submit')}
          size="lg"
          variant="primary"
          onPress={form.handleSubmit(handleSignIn)}
          disabled={!form.formState.isValid || mutation.isPending || resendMutation.isPending}
          isLoading={mutation.isPending || resendMutation.isPending}
        />
      </View>
    </Form>
  );
};

export default SignInForm;
