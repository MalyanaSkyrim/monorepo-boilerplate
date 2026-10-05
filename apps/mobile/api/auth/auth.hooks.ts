import { useAuthContext } from '@/lib/contexts/AuthContext';
import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { createMutationRetry, createQueryOptions } from '@/lib/api/query-config';
import type {
  ForgotPasswordInput,
  ForgotPasswordOutput,
  HealthOutput,
  OAuthInput,
  OAuthOutput,
  ProfileOutput,
  ResetPasswordInput,
  ResetPasswordOutput,
  SendVerificationCodeInput,
  SendVerificationCodeOutput,
  SigninInput,
  SigninOutput,
  SignupInput,
  SignupOutput,
  UpdateProfileInput,
  VerifyEmailInput,
  VerifyEmailOutput,
} from '@app/http-client';

import type { UserProfile } from '@/lib/storage/auth-storage';

import {
  forgotPassword,
  getHealth,
  getProfile,
  oauthSignIn,
  resetPassword,
  sendVerificationCode,
  signin,
  signup,
  updateProfile,
  verifyEmail,
} from './auth.handlers';

/**
 * The API returns dates as Date objects (zod coerces them); UserProfile stores
 * ISO strings. Shared by every hook that writes a profile into AuthContext.
 */
const toUserProfile = (user: {
  id: string;
  email: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName ?? null,
  phone: user.phone ?? null,
  avatar: null,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
  emailVerified: user.emailVerified?.toISOString() ?? null,
});

export const useSignin = () => {
  const { signIn } = useAuthContext();

  return useMutation<SigninOutput, Error, SigninInput>({
    mutationFn: signin,
    retry: createMutationRetry(),
    onSuccess: async (data) => {
      await signIn(toUserProfile(data.user), data.accessToken);
    },
  });
};

export const useSignup = () => {
  return useMutation<SignupOutput, Error, SignupInput>({
    mutationFn: signup,
    retry: createMutationRetry(),
  });
};

export const useOAuthSignIn = () => {
  const { signIn } = useAuthContext();

  return useMutation<OAuthOutput, Error, OAuthInput>({
    mutationFn: oauthSignIn,
    retry: createMutationRetry(),
    onSuccess: async (data) => {
      await signIn(toUserProfile(data.user), data.accessToken);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation<ForgotPasswordOutput, Error, ForgotPasswordInput>({
    mutationFn: forgotPassword,
    retry: createMutationRetry(),
  });
};

export const useResetPassword = () => {
  return useMutation<ResetPasswordOutput, Error, ResetPasswordInput>({
    mutationFn: resetPassword,
    retry: createMutationRetry(),
  });
};

export const useSendVerificationCode = () => {
  return useMutation<SendVerificationCodeOutput, Error, SendVerificationCodeInput>({
    mutationFn: sendVerificationCode,
    retry: createMutationRetry(),
  });
};

export const useVerifyEmail = () => {
  const { signIn } = useAuthContext();

  return useMutation<VerifyEmailOutput, Error, VerifyEmailInput>({
    mutationFn: verifyEmail,
    retry: createMutationRetry(),
    // Confirming the code proves the user owns the address, so the API hands
    // back a token and we sign them straight in. NavigationGuard then moves
    // them off the (auth) group on its own.
    onSuccess: async (data) => {
      await signIn(toUserProfile(data.user), data.accessToken);
    },
  });
};

export const useProfile = (options?: Partial<UseQueryOptions<ProfileOutput, Error>>) => {
  const { updateProfile } = useAuthContext();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const profile = await getProfile();
      await updateProfile(toUserProfile(profile));
      return profile;
    },
    ...createQueryOptions(options),
  });
};

export const useUpdateProfile = () => {
  const { profile, updateProfile: updateLocalProfile } = useAuthContext();

  return useMutation<ProfileOutput, Error, UpdateProfileInput>({
    mutationFn: updateProfile,
    onSuccess: async (data) => {
      // Create a full profile combining old and new data to update context
      const updatedProfile = {
        ...profile!,
        firstName: data.firstName,
        lastName: data.lastName ?? null,
        email: data.email,
        phone: data.phone ?? null,
        updatedAt: data.updatedAt.toISOString(),
      };

      await updateLocalProfile(updatedProfile);
    },
  });
};

export const useHealth = (options?: Partial<UseQueryOptions<HealthOutput, Error>>) => {
  return useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    ...createQueryOptions(options),
  });
};
