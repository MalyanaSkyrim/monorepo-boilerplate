import { sendEmailVerificationCodeEmail } from '../../../../lib/email/sendEmailVerificationCodeEmail'
import {
  EmailAlreadyVerifiedError,
  UserNotFoundError,
} from '../../../../lib/error/modules/AuthErrors'
import { createEmailVerificationCode } from '../email-verification.services'
import { getUserByEmail } from '../signin/signin.services'

const SUCCESS_MESSAGE = 'A verification code has been sent to your email.'

export const requestUserEmailVerification = async (
  email: string,
): Promise<{ message: string }> => {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new UserNotFoundError()
  }

  if (user.emailVerified !== null) {
    throw new EmailAlreadyVerifiedError({
      message: 'This email address has already been verified. Please sign in.',
    })
  }

  const code = await createEmailVerificationCode({
    userId: user.id,
    email: user.email,
  })

  await sendEmailVerificationCodeEmail({
    to: user.email,
    code,
    idempotencyId: user.id,
  })

  return { message: SUCCESS_MESSAGE }
}
