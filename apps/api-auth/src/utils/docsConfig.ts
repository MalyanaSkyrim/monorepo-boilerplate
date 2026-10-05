import { brand } from '@app/common'
import { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

import { env } from '../env'

const publicTags = [
  {
    name: 'Server Health',
    description:
      'This section contains an endpoint for checking if the server is online.',
  },
]

export const getDocsConfig = (
  isPrivate = false,
): FastifyDynamicSwaggerOptions => ({
  stripBasePath: true,
  hideUntagged: true,
  openapi: {
    info: {
      title: 'Auth API',
      description:
        'REST API that handles sign-up, sign-in, OAuth, email verification and password reset.',
      version: '1',
      contact: {
        name: brand.displayName,
        email: brand.supportEmail,
        url: brand.urls.website,
      },
    },
    servers: [
      {
        url: env.API_AUTH_URL || 'http://localhost:4000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter your JWT bearer token in the format "Bearer <token>"',
        },
        apiKey: {
          type: 'apiKey',
          name: 'authorization',
          in: 'header',
          description:
            "To get an API key, please contact us. We'll be happy to help you.",
        },
        serviceKey: {
          type: 'apiKey',
          name: 'authorization',
          in: 'header',
          description: 'To get the service key, please contact us.',
        },
      },
    },
    externalDocs: {
      url: brand.urls.docs,
      description: 'Ecom API specifications',
    },
    tags: isPrivate ? [...publicTags] : publicTags,
  },
  transform: ({ schema, url }) => {
    const transformedSchema = { ...schema }

    if (isPrivate) {
      transformedSchema.hide = false
    }

    return {
      schema: transformedSchema,
      url,
    }
  },
})
