import { RouteHandler } from 'fastify'

import { generateUserTokens } from '../../../../lib/auth/jwt'
import {
  InvalidVerificationCodeError,
  TooManyVerificationAttemptsError,
  UserNotFoundError,
} from '../../../../lib/error'
import { consumeEmailVerificationCode } from '../email-verification.services'
import { getUserById } from '../profile/profile.services'
import type {
  UserVerifyEmailErrorOutput,
  UserVerifyEmailInput,
  UserVerifyEmailSuccessOutput,
} from './verify-email.schema'

export const userVerifyEmailHandler: RouteHandler<{
  Body: UserVerifyEmailInput
  Reply: {
    '2xx': UserVerifyEmailSuccessOutput
    '4xx': UserVerifyEmailErrorOutput
    '5xx': UserVerifyEmailErrorOutput
  }
}> = async (req, reply) => {
  const { email, code } = req.body

  const result = await consumeEmailVerificationCode({ email, code })

  if (result.status === 'too_many_attempts') {
    throw new TooManyVerificationAttemptsError({
      message: 'Too many incorrect attempts. Request a new code and try again.',
      meta: { email },
    })
  }

  if (result.status === 'invalid') {
    throw new InvalidVerificationCodeError({
      message: 'That code is invalid or has expired. Request a new one.',
      meta: { email },
    })
  }

  const user = await getUserById(result.userId)
  if (!user) {
    throw new UserNotFoundError()
  }

  const { accessToken } = generateUserTokens(user.id, user.email)

  reply.code(200).send({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    accessToken,
  })
}
