import { FastifyInstance } from 'fastify'

import { healthSchemas } from './modules/health/health.schema'
import { userForgotPasswordSchemas } from './modules/v1/auth/forgot-password/forgot-password.schema'
import { userOAuthSchemas } from './modules/v1/auth/oauth/oauth.schema'
import { userProfileSchemas } from './modules/v1/auth/profile/profile.schema'
import { userResetPasswordSchemas } from './modules/v1/auth/reset-password/reset-password.schema'
import { userSendVerificationCodeSchemas } from './modules/v1/auth/send-verification-code/send-verification-code.schema'
import { userSigninSchemas } from './modules/v1/auth/signin/signin.schema'
import { userSignupSchemas } from './modules/v1/auth/signup/signup.schema'
import { userVerifyEmailSchemas } from './modules/v1/auth/verify-email/verify-email.schema'

export const registerSchemas = async (
  server: FastifyInstance,
): Promise<void> => {
  for (const schema of [
    ...healthSchemas,
    ...userSigninSchemas,
    ...userSignupSchemas,
    ...userProfileSchemas,
    ...userForgotPasswordSchemas,
    ...userOAuthSchemas,
    ...userResetPasswordSchemas,
    ...userSendVerificationCodeSchemas,
    ...userVerifyEmailSchemas,
  ]) {
    server.addSchema(schema)
  }
}
