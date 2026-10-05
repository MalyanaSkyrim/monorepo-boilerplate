import { db } from '@app/database'

import type { UserUpdateProfileInput } from './profile.schema'

export const getUserById = (userId: string) => {
  return db.user.findUnique({
    where: { id: userId },
  })
}

export const updateUserById = (
  userId: string,
  data: UserUpdateProfileInput,
) => {
  return db.user.update({
    where: { id: userId },
    data,
  })
}
