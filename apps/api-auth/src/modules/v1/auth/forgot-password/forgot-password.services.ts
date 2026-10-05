import { sendPasswordResetCodeEmail } from '../../../../lib/email/sendPasswordResetCodeEmail'
import { UserNotFoundError } from '../../../../lib/error/modules/AuthErrors'
import { createPasswordResetCode } from '../password-reset.services'
import { getUserByEmail } from '../signin/signin.services'

const SUCCESS_MESSAGE =
  'If an account exists for this email, a reset code has been sent.'

export const requestUserPasswordReset = async (
  email: string,
): Promise<{ message: string }> => {
  const user = await getUserByEmail(email)
  if (!user || user.password === null) {
    throw new UserNotFoundError()
  }

  const code = await createPasswordResetCode({
    userId: user.id,
    email: user.email,
  })

  await sendPasswordResetCodeEmail({
    to: user.email,
    code,
    idempotencyId: user.id,
  })

  return { message: SUCCESS_MESSAGE }
}
