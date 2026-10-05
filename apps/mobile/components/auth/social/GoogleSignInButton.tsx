import {
  ensureGoogleSignInConfigured,
  isGoogleSignInConfiguredForCurrentPlatform,
  startGoogleSignInFlow,
} from '@/lib/auth/googleNativeSignIn';
import { getOAuthExtra } from '@/lib/auth/oauth-config';
import { extractErrorMessage } from '@/lib/utils/error';
import { Button } from '@app/mobile-ui';
import type { User } from '@react-native-google-signin/google-signin';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner-native';

import GoogleIcon from '../../../assets/social/google.svg';

/** Google Sign-In + `idToken` for api-auth `POST .../oauth`. @see https://react-native-google-signin.github.io/docs/original */

export type GoogleSignInSuccessPayload = {
  user: User;
  idToken: string;
};

export type GoogleSignInButtonProps = {
  /** Full-width labeled button (e.g. signup) vs compact icon for sign-in row. */
  presentation?: 'full' | 'icon';
  /** Required when `presentation` is `'full'`. */
  label?: string;
  disabled?: boolean;
  /** When true, shows loading (e.g. oauth mutation in parent). */
  apiPending?: boolean;
  onSuccess?: (payload: GoogleSignInSuccessPayload) => void;
};

export function GoogleSignInButton({
  presentation = 'full',
  label,
  disabled = false,
  apiPending = false,
  onSuccess,
}: GoogleSignInButtonProps) {
  const [busy, setBusy] = useState(false);

  const extra = getOAuthExtra();
  const configured = isGoogleSignInConfiguredForCurrentPlatform(extra);
  const loading = busy || apiPending;

  useEffect(() => {
    const e = getOAuthExtra();
    if (isGoogleSignInConfiguredForCurrentPlatform(e)) {
      ensureGoogleSignInConfigured(e);
    }
  }, []);

  const handlePress = useCallback(async () => {
    const currentExtra = getOAuthExtra();
    if (!isGoogleSignInConfiguredForCurrentPlatform(currentExtra)) {
      return;
    }
    setBusy(true);
    try {
      const result = await startGoogleSignInFlow(currentExtra);
      if (result.ok) {
        onSuccess?.({ user: result.user, idToken: result.idToken });
        return;
      }
      if ('cancelled' in result && result.cancelled) {
        return;
      }
      if ('error' in result) {
        toast.error(extractErrorMessage(result.error));
      }
    } finally {
      setBusy(false);
    }
  }, [onSuccess]);

  if (!configured) {
    return null;
  }

  if (presentation === 'icon') {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="h-14 w-14 min-w-[56px] px-0"
        icon={GoogleIcon}
        onPress={() => {
          void handlePress();
        }}
        disabled={disabled || loading}
        isLoading={loading}
      />
    );
  }

  return (
    <Button
      variant="secondary"
      size="lg"
      className="w-full"
      label={label ?? ''}
      icon={GoogleIcon}
      onPress={() => {
        void handlePress();
      }}
      disabled={disabled || loading}
      isLoading={loading}
    />
  );
}
