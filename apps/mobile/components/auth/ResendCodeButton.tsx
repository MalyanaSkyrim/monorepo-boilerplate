import { api } from '@/api';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { extractErrorMessage } from '@/lib/utils/error';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

const RESEND_COOLDOWN_SECONDS = 60;

type ResendCodeButtonProps = {
  email: string;
};

const ResendCodeButton = ({ email }: ResendCodeButtonProps) => {
  const { t } = useTranslation('auth.resendCode');
  const { t: tOtp } = useTranslation('auth.otp');
  const { t: tRoot } = useTranslation();
  const { remaining, isComplete, restart } = useCountdown(RESEND_COOLDOWN_SECONDS);
  const mutation = api.auth.sendVerificationCode.useMutation();

  const handleResend = () => {
    mutation
      .mutateAsync({ email })
      .then(() => {
        toast.success(tOtp('codeSent'));
        restart();
      })
      .catch((error: unknown) => {
        toast.error(extractErrorMessage(error, undefined, tRoot));
      });
  };

  if (!isComplete) {
    return (
      <Text className="text-center text-sm text-greyscale-400">
        {t('canResendIn')} {remaining} {t('seconds')}
      </Text>
    );
  }

  return (
    <View className="flex-row items-center justify-center gap-2">
      <Pressable onPress={handleResend} disabled={mutation.isPending}>
        <Text className="text-sm font-semibold text-primary-300">{t('canResend')}</Text>
      </Pressable>
      {mutation.isPending && <ActivityIndicator size="small" />}
    </View>
  );
};

export default ResendCodeButton;
