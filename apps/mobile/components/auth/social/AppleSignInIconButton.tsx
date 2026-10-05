import { getOAuthExtra } from '@/lib/auth/oauth-config';
import { shouldShowAppleSignIn } from '@/lib/auth/appleSignInAvailability';
import { extractErrorMessage } from '@/lib/utils/error';
import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { toast } from 'sonner-native';
import { v4 as uuidv4 } from 'uuid';

import AppleIcon from '../../../assets/social/apple.svg';

function errorCodeString(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return '';
  }
  if (!('code' in error)) {
    return '';
  }
  const code = Reflect.get(error, 'code');
  if (typeof code === 'string') {
    return code;
  }
  if (typeof code === 'number') {
    return String(code);
  }
  return '';
}

export type AppleSignInIconButtonProps = {
  disabled?: boolean;
  apiPending?: boolean;
  onSuccess: (payload: { idToken: string }) => void;
};

export function AppleSignInIconButton({
  disabled = false,
  apiPending = false,
  onSuccess,
}: AppleSignInIconButtonProps) {
  const [busy, setBusy] = useState(false);
  const extra = getOAuthExtra();
  const visible = shouldShowAppleSignIn(extra);
  const loading = busy || apiPending;

  const handleIosPress = useCallback(async () => {
    setBusy(true);
    try {
      const response = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const idToken = response.identityToken;
      if (idToken === null || idToken.length === 0) {
        toast.error('Apple sign-in did not return an identity token.');
        return;
      }
      onSuccess({ idToken });
    } catch (e) {
      if (errorCodeString(e) === String(appleAuth.Error.CANCELED)) {
        return;
      }
      toast.error(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, [onSuccess]);

  const handleAndroidPress = useCallback(async () => {
    const serviceId = extra.appleSignInAndroidServiceId;
    const redirectUri = extra.appleSignInAndroidRedirectUri;
    if (serviceId === undefined || redirectUri === undefined) {
      return;
    }
    setBusy(true);
    try {
      appleAuthAndroid.configure({
        clientId: serviceId,
        redirectUri,
        responseType: appleAuthAndroid.ResponseType.ALL,
        scope: appleAuthAndroid.Scope.ALL,
        nonce: uuidv4(),
        state: uuidv4(),
      });
      const response = await appleAuthAndroid.signIn();
      const idToken = response.id_token;
      if (idToken === undefined || idToken.length === 0) {
        toast.error('Apple sign-in did not return an ID token.');
        return;
      }
      onSuccess({ idToken });
    } catch (e) {
      if (errorCodeString(e) === appleAuthAndroid.Error.SIGNIN_CANCELLED) {
        return;
      }
      toast.error(extractErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }, [extra.appleSignInAndroidRedirectUri, extra.appleSignInAndroidServiceId, onSuccess]);

  const handlePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      void handleIosPress();
      return;
    }
    void handleAndroidPress();
  }, [handleAndroidPress, handleIosPress]);

  if (!visible) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign in with Apple"
      disabled={disabled || loading}
      onPress={handlePress}
      className="h-14 w-14 items-center justify-center rounded-xl border border-greyscale-100 bg-white shadow-button-secondary-normal active:border-greyscale-300">
      <View className="h-14 w-14 items-center justify-center">
        {loading ? <ActivityIndicator size="small" /> : <AppleIcon width={28} height={28} />}
      </View>
    </Pressable>
  );
}
