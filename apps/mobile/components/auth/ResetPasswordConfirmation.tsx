import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { Button, Modal } from '@app/mobile-ui';
import React from 'react';
import { Text, View } from 'react-native';
import SuccessIcon from '../../assets/common/success-icon.svg';

const ResetPasswordConfirmation = ({
  isOpen,
  onOpenChange,
  onConfirm,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) => {
  const { t } = useTranslation('auth.resetPassword.success');
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onOpenChange(false)}
      size="sm"
      body={{
        children: (
          <View className="flex-1 items-center justify-between gap-y-4">
            <SuccessIcon />
            <View className="items-center gap-y-1">
              <Text className="text-lg font-bold">{t('title')}</Text>
              <Text className="text-center text-sm font-light text-greyscale-400">
                {t('subtitle')}
              </Text>
            </View>
            <Button label={t('login')} className="w-full" onPress={onConfirm} />
          </View>
        ),
      }}
    />
  );
};

export default ResetPasswordConfirmation;
