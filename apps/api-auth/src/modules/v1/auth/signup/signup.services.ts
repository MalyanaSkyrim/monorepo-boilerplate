import { db } from '@app/database'

import { hashPassword } from '../../../../lib/auth/password'
import type { UserSignupInput } from './signup.schema'

export const getUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: { email },
  })
}

export const createUser = async (data: UserSignupInput) => {
  const { password, ...rest } = data
  const hashedPassword = await hashPassword(password)
  return db.user.create({
    data: {
      password: hashedPassword,
      ...rest,
    },
  })
}
