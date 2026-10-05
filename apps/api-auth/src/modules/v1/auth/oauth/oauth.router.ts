import { FastifyPluginAsync } from 'fastify'

import { userOAuthHandler } from './oauth.controller'
import { schema } from './oauth.schema'

const userOAuth: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post('/', { schema }, userOAuthHandler)
}

export default userOAuth
