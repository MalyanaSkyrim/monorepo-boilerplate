import type { User } from '@react-native-google-signin/google-signin';
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';

import type { OAuthExtra } from './oauth-config';

let didConfigure = false;

/**
 * Web `webClientId` required; iOS also needs `iosClientId` in Expo extra.
 * @see https://react-native-google-signin.github.io/docs/original
 */
export function isGoogleSignInConfiguredForCurrentPlatform(extra: OAuthExtra): boolean {
  if (Platform.OS === 'web') {
    return false;
  }
  if (extra.googleOAuthWebClientId === undefined) {
    return false;
  }
  if (Platform.OS === 'ios' && extra.googleOAuthIosClientId === undefined) {
    return false;
  }
  return true;
}

/** Safe to call multiple times; configures once when ids are present. */
export function ensureGoogleSignInConfigured(extra: OAuthExtra): void {
  if (Platform.OS === 'web' || !isGoogleSignInConfiguredForCurrentPlatform(extra)) {
    return;
  }
  if (didConfigure) {
    return;
  }
  const webClientId = extra.googleOAuthWebClientId;
  if (webClientId === undefined) {
    return;
  }
  GoogleSignin.configure({
    webClientId,
    offlineAccess: false,
    ...(Platform.OS === 'ios' && extra.googleOAuthIosClientId !== undefined
      ? { iosClientId: extra.googleOAuthIosClientId }
      : {}),
  });
  didConfigure = true;
}

export type GoogleNativeSignInResult =
  | { ok: true; user: User; idToken: string }
  | { ok: false; cancelled: true }
  | { ok: false; error: unknown };

async function idTokenFromSignedInUser(user: User): Promise<GoogleNativeSignInResult> {
  let idToken = user.idToken ?? '';
  if (idToken.length === 0) {
    const tokens = await GoogleSignin.getTokens();
    idToken = tokens.idToken;
  }
  if (idToken.length === 0) {
    return { ok: false, error: new Error('Google sign-in did not return an ID token.') };
  }
  return { ok: true, user, idToken };
}

function resultFromNonSuccessResponse(
  response: Awaited<ReturnType<typeof GoogleSignin.signIn>>
): GoogleNativeSignInResult {
  if (isCancelledResponse(response)) {
    return { ok: false, cancelled: true };
  }
  return { ok: false, error: new Error('Unexpected Google sign-in response.') };
}

function resultFromCaughtError(error: unknown): GoogleNativeSignInResult {
  if (!isErrorWithCode(error)) {
    return { ok: false, error };
  }
  switch (error.code) {
    case statusCodes.SIGN_IN_CANCELLED:
      return { ok: false, cancelled: true };
    case statusCodes.IN_PROGRESS:
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
    default:
      return { ok: false, error };
  }
}

/**
 * Native `signIn()` then resolve `idToken` for api-auth (see `User.idToken` / `getTokens()`).
 * @see https://react-native-google-signin.github.io/docs/original
 */
export async function startGoogleSignInFlow(extra: OAuthExtra): Promise<GoogleNativeSignInResult> {
  if (Platform.OS === 'web') {
    return { ok: false, error: new Error('Google native sign-in is not available on web.') };
  }
  if (!isGoogleSignInConfiguredForCurrentPlatform(extra)) {
    return { ok: false, error: new Error('Google sign-in is not configured.') };
  }

  ensureGoogleSignInConfigured(extra);

  try {
    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    }

    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return resultFromNonSuccessResponse(response);
    }
    return idTokenFromSignedInUser(response.data);
  } catch (error: unknown) {
    return resultFromCaughtError(error);
  }
}
