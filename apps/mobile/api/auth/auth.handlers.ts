import { apiAuth } from '@/lib/api/auth';
import { getAccessToken } from '@/lib/storage/auth-storage';
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

export const signin = async (input: SigninInput): Promise<SigninOutput> => {
  const response = await apiAuth.signin(input);
  return response;
};

export const signup = async (input: SignupInput): Promise<SignupOutput> => {
  const response = await apiAuth.signup(input);
  return response;
};

export const oauthSignIn = async (input: OAuthInput): Promise<OAuthOutput> => {
  const response = await apiAuth.oauth(input);
  return response;
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<ForgotPasswordOutput> => {
  return apiAuth.forgotPassword(input);
};

export const resetPassword = async (input: ResetPasswordInput): Promise<ResetPasswordOutput> => {
  return apiAuth.resetPassword(input);
};

export const sendVerificationCode = async (
  input: SendVerificationCodeInput
): Promise<SendVerificationCodeOutput> => {
  return apiAuth.sendVerificationCode(input);
};

export const verifyEmail = async (input: VerifyEmailInput): Promise<VerifyEmailOutput> => {
  return apiAuth.verifyEmail(input);
};

export const getProfile = async (): Promise<ProfileOutput> => {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No authentication token found. Please sign in.');
  }

  apiAuth.setToken(token);
  const response = await apiAuth.profile();

  return response;
};

export const updateProfile = async (input: UpdateProfileInput): Promise<ProfileOutput> => {
  const token = await getAccessToken();

  if (!token) {
    throw new Error('No authentication token found. Please sign in.');
  }

  apiAuth.setToken(token);
  return apiAuth.updateProfile(input);
};

export const getHealth = async (): Promise<HealthOutput> => {
  const response = await apiAuth.getHealth();
  return response;
};
