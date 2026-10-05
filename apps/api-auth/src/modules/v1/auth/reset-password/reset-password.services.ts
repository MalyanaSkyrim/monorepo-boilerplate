import { db } from '@app/database'

import { hashPassword } from '../../../../lib/auth/password'
import { consumePasswordResetCode } from '../password-reset.services'

export const resetUserPassword = async ({
  email,
  code,
  password,
}: {
  email: string
  code: string
  password: string
}): Promise<boolean> => {
  const result = await consumePasswordResetCode({
    email,
    code,
  })

  if (!result) return false

  const hashedPassword = await hashPassword(password)

  await db.user.update({
    where: { id: result.userId },
    data: { password: hashedPassword },
  })

  return true
}
