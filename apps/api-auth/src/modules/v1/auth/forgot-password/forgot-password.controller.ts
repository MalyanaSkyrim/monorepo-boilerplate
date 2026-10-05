import { RouteHandler } from 'fastify'

import type {
  UserForgotPasswordErrorOutput,
  UserForgotPasswordInput,
  UserForgotPasswordSuccessOutput,
} from './forgot-password.schema'
import { requestUserPasswordReset } from './forgot-password.services'

export const userForgotPasswordHandler: RouteHandler<{
  Body: UserForgotPasswordInput
  Reply: {
    '2xx': UserForgotPasswordSuccessOutput
    '4xx': UserForgotPasswordErrorOutput
    '5xx': UserForgotPasswordErrorOutput
  }
}> = async (req, reply) => {
  const result = await requestUserPasswordReset(req.body.email)
  reply.code(200).send(result)
}
