import bcrypt from 'bcryptjs'

export const verifyPassword = (password: string, hashed: string) =>
  bcrypt.compare(password, hashed)

export const hashPassword = (password: string, rounds = 12) =>
  bcrypt.hash(password, rounds)
