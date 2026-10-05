import { RouteHandler } from 'fastify'

import { generateUserTokens } from '../../../../lib/auth/jwt'
import { verifyPassword } from '../../../../lib/auth/password'
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
} from '../../../../lib/error'
import type {
  UserSigninErrorOutput,
  UserSigninInput,
  UserSigninSuccessOutput,
} from './signin.schema'
import { getUserByEmail } from './signin.services'

export const userSigninHandler: RouteHandler<{
  Body: UserSigninInput
  Reply: {
    '2xx': UserSigninSuccessOutput
    '4xx': UserSigninErrorOutput
    '5xx': UserSigninErrorOutput
  }
}> = async (req, reply) => {
  const { email, password } = req.body

  const user = await getUserByEmail(email)
  if (!user) {
    throw new InvalidCredentialsError({
      message:
        'Invalid email or password. Please check your credentials and try again.',
      meta: { email },
    })
  }

  if (user.password === null) {
    throw new InvalidCredentialsError({
      message:
        'Invalid email or password. Please check your credentials and try again.',
      meta: { email, userId: user.id },
    })
  }

  const valid = await verifyPassword(password, user.password)
  if (!valid) {
    throw new InvalidCredentialsError({
      message:
        'Invalid email or password. Please check your credentials and try again.',
      meta: { email, userId: user.id },
    })
  }

  // After the password check on purpose: an unverified-email response before it
  // would tell an attacker which addresses have accounts.
  if (user.emailVerified === null) {
    throw new EmailNotVerifiedError({
      message:
        'Please confirm your email address before signing in. We can send you a new code.',
      meta: { email },
    })
  }

  const { accessToken } = generateUserTokens(user.id, user.email)

  reply.code(200).send({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      emailVerified: user.emailVerified.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    accessToken,
  })
}
