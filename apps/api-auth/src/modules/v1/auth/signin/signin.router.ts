import { FastifyPluginAsync } from 'fastify'

import { userSigninHandler } from './signin.controller'
import { schema } from './signin.schema'

const userSignin: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/', { schema }, userSigninHandler)
}

export default userSignin
