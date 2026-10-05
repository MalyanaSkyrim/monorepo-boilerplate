import { FastifyPluginAsync } from 'fastify'

import { userResetPasswordHandler } from './reset-password.controller'
import { schema } from './reset-password.schema'

const userResetPasswordRouter: FastifyPluginAsync = async (server) => {
  server.post('/', { schema }, userResetPasswordHandler)
}

export default userResetPasswordRouter
