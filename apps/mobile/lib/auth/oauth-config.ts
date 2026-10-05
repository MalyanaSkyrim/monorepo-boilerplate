import Constants from 'expo-constants';

export type OAuthExtra = {
  /** Web application OAuth client id (`GoogleSignin.configure({ webClientId })`). */
  googleOAuthWebClientId?: string;
  googleOAuthIosClientId?: string;
  googleOAuthAndroidClientId?: string;
  facebookAppId?: string;
  /** Apple Services ID for Sign in with Apple on Android (Invertase web flow). */
  appleSignInAndroidServiceId?: string;
  /** Return URL registered in Apple Developer for the Android Service ID. */
  appleSignInAndroidRedirectUri?: string;
};

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

export function getOAuthExtra(): OAuthExtra {
  const extra = Constants.expoConfig?.extra;
  if (extra === undefined || typeof extra !== 'object' || extra === null) {
    return {};
  }
  const e = extra as Record<string, unknown>;
  return {
    googleOAuthWebClientId: nonEmptyString(e.googleOAuthWebClientId),
    googleOAuthIosClientId: nonEmptyString(e.googleOAuthIosClientId),
    googleOAuthAndroidClientId: nonEmptyString(e.googleOAuthAndroidClientId),
    facebookAppId: nonEmptyString(e.facebookAppId),
    appleSignInAndroidServiceId: nonEmptyString(e.appleSignInAndroidServiceId),
    appleSignInAndroidRedirectUri: nonEmptyString(e.appleSignInAndroidRedirectUri),
  };
}
