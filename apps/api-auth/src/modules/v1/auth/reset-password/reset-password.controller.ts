import { RouteHandler } from 'fastify'

import type {
  UserResetPasswordErrorOutput,
  UserResetPasswordInput,
  UserResetPasswordSuccessOutput,
} from './reset-password.schema'
import { resetUserPassword } from './reset-password.services'

export const userResetPasswordHandler: RouteHandler<{
  Body: UserResetPasswordInput
  Reply: {
    '2xx': UserResetPasswordSuccessOutput
    '4xx': UserResetPasswordErrorOutput
    '5xx': UserResetPasswordErrorOutput
  }
}> = async (req, reply) => {
  const didReset = await resetUserPassword(req.body)
  if (!didReset) {
    reply.code(400).send({
      message: 'Invalid or expired code.',
      code: 'VALIDATION_ERROR',
    })
    return
  }

  reply.code(200).send({ message: 'Password has been reset successfully.' })
}
