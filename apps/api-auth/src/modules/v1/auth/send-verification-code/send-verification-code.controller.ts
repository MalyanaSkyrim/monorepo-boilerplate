import { RouteHandler } from 'fastify'

import type {
  UserSendVerificationCodeErrorOutput,
  UserSendVerificationCodeInput,
  UserSendVerificationCodeSuccessOutput,
} from './send-verification-code.schema'
import { requestUserEmailVerification } from './send-verification-code.services'

export const userSendVerificationCodeHandler: RouteHandler<{
  Body: UserSendVerificationCodeInput
  Reply: {
    '2xx': UserSendVerificationCodeSuccessOutput
    '4xx': UserSendVerificationCodeErrorOutput
    '5xx': UserSendVerificationCodeErrorOutput
  }
}> = async (req, reply) => {
  const result = await requestUserEmailVerification(req.body.email)
  reply.code(200).send(result)
}
