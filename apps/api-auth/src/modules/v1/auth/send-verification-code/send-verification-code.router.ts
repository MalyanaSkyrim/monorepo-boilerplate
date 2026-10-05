import { FastifyPluginAsync } from 'fastify'

import { userSendVerificationCodeHandler } from './send-verification-code.controller'
import { schema } from './send-verification-code.schema'

const userSendVerificationCode: FastifyPluginAsync = async (
  fastify,
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema,
      // Tighter than the global 500/60s: this endpoint sends email.
      config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    },
    userSendVerificationCodeHandler,
  )
}

export default userSendVerificationCode
