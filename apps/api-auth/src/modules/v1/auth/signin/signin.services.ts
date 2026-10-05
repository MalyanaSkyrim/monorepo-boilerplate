import { db } from '@app/database'

export const getUserByEmail = (email: string) => {
  return db.user.findUnique({
    where: { email },
  })
}
