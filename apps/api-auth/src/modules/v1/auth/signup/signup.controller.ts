import { RouteHandler } from 'fastify'

import { sendEmailVerificationCodeEmail } from '../../../../lib/email/sendEmailVerificationCodeEmail'
import {
  UserCreationFailedError,
  EmailAlreadyExistsError,
} from '../../../../lib/error'
import { createEmailVerificationCode } from '../email-verification.services'
import type {
  UserSignupErrorOutput,
  UserSignupInput,
  UserSignupSuccessOutput,
} from './signup.schema'
import { createUser, getUserByEmail } from './signup.services'

export const userSignupHandler: RouteHandler<{
  Body: UserSignupInput
  Reply: {
    '2xx': UserSignupSuccessOutput
    '4xx': UserSignupErrorOutput
    '5xx': UserSignupErrorOutput
  }
}> = async (req, reply) => {
  const { email } = req.body

  const existing = await getUserByEmail(email)
  if (existing) {
    throw new EmailAlreadyExistsError({
      message: `An account with the email '${email}' already exists. Please use a different email or try signing in.`,
      meta: { email, existingUserId: existing.id },
    })
  }

  let user: Awaited<ReturnType<typeof createUser>>
  try {
    user = await createUser(req.body)
  } catch (error) {
    throw new UserCreationFailedError({
      message:
        'Failed to create user account. Please try again or contact support if the issue persists.',
      meta: {
        originalError: error instanceof Error ? error.message : 'Unknown error',
        email,
      },
    })
  }

  // Deliberately outside the try above, and deliberately non-fatal: the user
  // row already exists, so failing the request over a mail outage would leave an
  // account the caller is never told about. They land on the OTP screen and can
  // resend from there.
  try {
    const code = await createEmailVerificationCode({
      userId: user.id,
      email: user.email,
    })
    await sendEmailVerificationCodeEmail({
      to: user.email,
      code,
      idempotencyId: user.id,
    })
  } catch (error) {
    req.log.error(
      { err: error, userId: user.id },
      'Failed to send signup verification code',
    )
  }

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
  })
}
