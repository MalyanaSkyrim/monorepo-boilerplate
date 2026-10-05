import { appleAuth, appleAuthAndroid } from '@invertase/react-native-apple-authentication';
import { Platform } from 'react-native';

import type { OAuthExtra } from './oauth-config';

/** iOS: native Sign in with Apple when supported. Android: Invertase web flow when configured. */
export function shouldShowAppleSignIn(extra: OAuthExtra): boolean {
  if (Platform.OS === 'ios') {
    return appleAuth.isSupported;
  }
  if (Platform.OS === 'android') {
    return (
      appleAuthAndroid.isSupported &&
      extra.appleSignInAndroidServiceId !== undefined &&
      extra.appleSignInAndroidRedirectUri !== undefined
    );
  }
  return false;
}
