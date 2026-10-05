import { FastifyPluginAsync } from 'fastify'

import {
  userProfileHandler,
  userUpdateProfileHandler,
} from './profile.controller'
import { schema, updateSchema } from './profile.schema'

const userProfile: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/', { schema }, userProfileHandler)
  fastify.patch('/', { schema: updateSchema }, userUpdateProfileHandler)
}

export default userProfile
