import { api } from '@/api';
import { AppleSignInIconButton } from '@/components/auth/social/AppleSignInIconButton';
import { GoogleSignInButton } from '@/components/auth/social';
import { shouldShowAppleSignIn } from '@/lib/auth/appleSignInAvailability';
import { getOAuthExtra } from '@/lib/auth/oauth-config';
import { isGoogleSignInConfiguredForCurrentPlatform } from '@/lib/auth/googleNativeSignIn';
import { extractErrorMessage } from '@/lib/utils/error';
import { useTranslation } from '@/src/lib/hooks/useTranslation';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { toast } from 'sonner-native';

function SignInOptions() {
  const { t } = useTranslation('auth.signIn.options');
  const extra = getOAuthExtra();
  const showGoogle = isGoogleSignInConfiguredForCurrentPlatform(extra);
  const showApple = shouldShowAppleSignIn(extra);
  const showSocialRow = showGoogle || showApple;

  const oauthMutation = api.auth.oauth.useMutation();

  useEffect(() => {
    if (oauthMutation.error) {
      toast.error(extractErrorMessage(oauthMutation.error));
    }
  }, [oauthMutation.error]);

  const handleSignUp = () => {
    router.push({ pathname: '/signup' });
  };

  return (
    <View className="flex-1 justify-between">
      {showSocialRow ? (
        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <View className="h-[1px] flex-1 bg-greyscale-100" />
            <Text className="text-sm text-greyscale-400">{t('orContinue')}</Text>
            <View className="h-[1px] flex-1 bg-greyscale-100" />
          </View>

          <View className="flex-row items-center justify-center gap-4">
            {showGoogle ? (
              <GoogleSignInButton
                presentation="icon"
                apiPending={oauthMutation.isPending}
                onSuccess={({ idToken }) => oauthMutation.mutate({ provider: 'google', idToken })}
              />
            ) : null}
            {showApple ? (
              <AppleSignInIconButton
                apiPending={oauthMutation.isPending}
                onSuccess={({ idToken }) => oauthMutation.mutate({ provider: 'apple', idToken })}
              />
            ) : null}
          </View>
        </View>
      ) : null}

      <View className="flex-row items-center justify-center gap-1">
        <Text className="text-center text-sm text-greyscale-400">{t('noAccount')}</Text>
        <Pressable onPress={handleSignUp}>
          <Text className="text-sm font-semibold text-primary-300">{t('signUp')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default SignInOptions;
