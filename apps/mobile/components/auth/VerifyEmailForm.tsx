import { api } from '@/api';
import { extractErrorMessage } from '@/lib/utils/error';
import { verifyEmailSchema, type VerifyEmailFormValues } from '@/lib/validations/auth';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormOtpInput, OTP_LENGTH } from '@app/mobile-ui';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import ResendCodeButton from './ResendCodeButton';

type VerifyEmailFormProps = {
  email: string;
};

const VerifyEmailForm = ({ email }: VerifyEmailFormProps) => {
  const { t } = useTranslation('auth.otp.form');
  const { t: tRoot } = useTranslation();
  const mutation = api.auth.verifyEmail.useMutation();

  const form = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      code: '',
    },
  });

  const onSubmit = (data: VerifyEmailFormValues) => {
    // No navigation on success: signIn() flips isAuthenticated and the
    // NavigationGuard moves us off the (auth) group. Racing it with a
    // router.replace here would fight that redirect.
    mutation.mutateAsync({ email, code: data.code }).catch((error: unknown) => {
      toast.error(extractErrorMessage(error, undefined, tRoot));
      form.reset();
    });
  };

  // Submit as soon as the sixth digit lands, so the button is a fallback rather
  // than a required tap.
  const code = form.watch('code');
  useEffect(() => {
    if (code.length === OTP_LENGTH && !mutation.isPending) {
      form.handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <Form form={form} onSubmit={onSubmit}>
      <View className="flex-1 justify-between">
        <View className="gap-6">
          <FormOtpInput name="code" control={form.control} />
          <ResendCodeButton email={email} />
        </View>

        <View className="pb-6">
          <Button
            label={t('submit')}
            variant="primary"
            size="lg"
            onPress={form.handleSubmit(onSubmit)}
            disabled={!form.formState.isValid || mutation.isPending}
            isLoading={mutation.isPending}
          />
        </View>
      </View>
    </Form>
  );
};

export default VerifyEmailForm;
