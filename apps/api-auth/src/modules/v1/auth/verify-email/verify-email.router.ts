import { FastifyPluginAsync } from 'fastify'

import { userVerifyEmailHandler } from './verify-email.controller'
import { schema } from './verify-email.schema'

const userVerifyEmail: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post(
    '/',
    {
      schema,
      // Tighter than the global 500/60s: a 6-digit code is guessable in bulk.
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    },
    userVerifyEmailHandler,
  )
}

export default userVerifyEmail
