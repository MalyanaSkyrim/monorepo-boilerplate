import type { User } from '@app/database'
import type { FastifyRequest, RouteHandler } from 'fastify'

import { verifyToken } from '../../../../lib/auth/jwt'
import { UserNotFoundError } from '../../../../lib/error'
import type {
  UserProfileErrorOutput,
  UserProfileSuccessOutput,
  UserUpdateProfileInput,
} from './profile.schema'
import { getUserById, updateUserById } from './profile.services'

type ProfileReply = {
  '2xx': UserProfileSuccessOutput
  '4xx': UserProfileErrorOutput
  '5xx': UserProfileErrorOutput
}

type AuthResult = { ok: true; userId: string } | { ok: false; message: string }

/** Reads and verifies the bearer token of the request. */
const authenticate = (req: FastifyRequest): AuthResult => {
  const authorization = req.headers.authorization

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      ok: false,
      message: 'Unauthorized. Please provide a valid authentication token.',
    }
  }

  try {
    return { ok: true, userId: verifyToken(authorization.substring(7)).sub }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Invalid or expired token. Please sign in again.',
    }
  }
}

const toProfileReply = (user: User): UserProfileSuccessOutput => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  phone: user.phone,
  emailVerified: user.emailVerified?.toISOString() ?? null,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
})

export const userProfileHandler: RouteHandler<{
  Reply: ProfileReply
}> = async (req, reply) => {
  const auth = authenticate(req)
  if (!auth.ok) {
    reply.code(401).send({ message: auth.message, code: 'UNAUTHORIZED' })
    return
  }

  const user = await getUserById(auth.userId)
  if (!user) {
    throw new UserNotFoundError()
  }

  reply.code(200).send(toProfileReply(user))
}

export const userUpdateProfileHandler: RouteHandler<{
  Body: UserUpdateProfileInput
  Reply: ProfileReply
}> = async (req, reply) => {
  const auth = authenticate(req)
  if (!auth.ok) {
    reply.code(401).send({ message: auth.message, code: 'UNAUTHORIZED' })
    return
  }

  const existing = await getUserById(auth.userId)
  if (!existing) {
    throw new UserNotFoundError()
  }

  const user = await updateUserById(auth.userId, req.body)
  reply.code(200).send(toProfileReply(user))
}
