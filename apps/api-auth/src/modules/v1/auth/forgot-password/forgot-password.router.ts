import { FastifyPluginAsync } from 'fastify'

import { userForgotPasswordHandler } from './forgot-password.controller'
import { schema } from './forgot-password.schema'

const userForgotPasswordRouter: FastifyPluginAsync = async (server) => {
  server.post('/', { schema }, userForgotPasswordHandler)
}

export default userForgotPasswordRouter
