import { withRefResolver } from '@app/common/server'
import swagger, { FastifyDynamicSwaggerOptions } from '@fastify/swagger'
import fp from 'fastify-plugin'

import { getDocsConfig } from '../utils/docsConfig'

export default fp<FastifyDynamicSwaggerOptions & { isDocPrivate: boolean }>(
  async (server, { isDocPrivate }) => {
    server.register(swagger, withRefResolver(getDocsConfig(isDocPrivate)))
  },
)
