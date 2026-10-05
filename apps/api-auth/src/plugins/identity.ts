import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

/**
 * Identity Plugin
 *
 * Currently all routes are public (health and auth).
 * This plugin is kept for future use when authentication is needed.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const identityPlugin: FastifyPluginAsync = async (_fastify) => {
  // All routes are currently public, so no authentication is required
  // This plugin can be extended in the future to add authentication
}

export default fp(identityPlugin, {
  fastify: '5.x',
  name: 'identity-plugin',
})
