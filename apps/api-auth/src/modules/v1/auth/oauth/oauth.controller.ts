import { RouteHandler } from 'fastify'

import type {
  UserOAuthErrorOutput,
  UserOAuthInput,
  UserOAuthSuccessOutput,
} from './oauth.schema'
import { resolveUserFromOAuth } from './oauth.services'

export const userOAuthHandler: RouteHandler<{
  Body: UserOAuthInput
  Reply: {
    '2xx': UserOAuthSuccessOutput
    '4xx': UserOAuthErrorOutput
    '5xx': UserOAuthErrorOutput
  }
}> = async (req, reply) => {
  const { user, accessToken } = await resolveUserFromOAuth(req.body)

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
    accessToken,
  })
}
