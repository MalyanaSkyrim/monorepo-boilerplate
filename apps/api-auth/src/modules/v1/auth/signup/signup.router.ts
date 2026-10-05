import { FastifyPluginAsync } from 'fastify'

import { userSignupHandler } from './signup.controller'
import { schema } from './signup.schema'

const userSignup: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/', { schema }, userSignupHandler)
}

export default userSignup
