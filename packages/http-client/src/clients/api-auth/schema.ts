import {
  errorReplySchema,
  forgotPasswordBodySchema,
  healthReplySchema,
  oauthBodySchema,
  passwordResetSuccessSchema,
  profileOutputSchema,
  resetPasswordBodySchema,
  sendVerificationCodeBodySchema,
  sendVerificationCodeOutputSchema,
  signinBodySchema,
  signinOutputSchema,
  signupBodySchema,
  signupOutputSchema,
  updateProfileBodySchema,
  verifyEmailBodySchema,
  verifyEmailOutputSchema,
} from '@app/common'
import { createSchema } from '@better-fetch/fetch'

export type {
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
} from '@app/common'

export const apiAuthSchema = createSchema(
  {
    '@get/health': {
      output: healthReplySchema,
    },
    '@post/v1/auth/signup': {
      body: signupBodySchema,
      output: signupOutputSchema,
    },
    '@post/v1/auth/signin': {
      body: signinBodySchema,
      output: signinOutputSchema,
    },
    '@post/v1/auth/oauth': {
      body: oauthBodySchema,
      output: signinOutputSchema,
    },
    '@get/v1/auth/profile': {
      output: profileOutputSchema,
    },
    '@patch/v1/auth/profile': {
      body: updateProfileBodySchema,
      output: profileOutputSchema,
    },
    '@post/v1/auth/forgot-password': {
      body: forgotPasswordBodySchema,
      output: passwordResetSuccessSchema,
    },
    '@post/v1/auth/reset-password': {
      body: resetPasswordBodySchema,
      output: passwordResetSuccessSchema,
    },
    '@post/v1/auth/send-verification-code': {
      body: sendVerificationCodeBodySchema,
      output: sendVerificationCodeOutputSchema,
    },
    '@post/v1/auth/verify-email': {
      body: verifyEmailBodySchema,
      output: verifyEmailOutputSchema,
    },
    error: {
      output: errorReplySchema,
    },
  },
  {
    strict: true,
  },
)
