import jwt from 'jsonwebtoken'

import { env } from '../../env'

export type DecodedToken = {
  sub: string
  email: string
}

export const verifyToken = (token: string): DecodedToken => {
  try {
    const decoded = jwt.verify(token, env.AUTH_SECRET)

    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.sub === 'string' &&
      typeof decoded.email === 'string'
    ) {
      return { sub: decoded.sub, email: decoded.email }
    }

    throw new Error('Invalid token payload')
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw error
  }
}

export const generateUserTokens = (userId: string, email: string) => {
  const accessToken = jwt.sign({ sub: userId, email }, env.AUTH_SECRET, {
    expiresIn: '1d',
  })
  return { accessToken }
}
