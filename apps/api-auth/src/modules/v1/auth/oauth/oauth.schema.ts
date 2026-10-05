import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

import { bindExamples } from '../../../../utils/swagger'
import { userSigninSuccessReplySchema } from '../signin/signin.schema'

const userOAuthSuccessReplySchema = userSigninSuccessReplySchema

export const userOAuthBodySchema = z.discriminatedUnion('provider', [
  z.object({
    provider: z.literal('google'),
    idToken: z.string().min(1),
  }),
  z.object({
    provider: z.literal('apple'),
    idToken: z.string().min(1),
  }),
  z.object({
    provider: z.literal('facebook'),
    accessToken: z.string().min(1),
  }),
])

export type UserOAuthInput = z.infer<typeof userOAuthBodySchema>

export type UserOAuthSuccessOutput = z.infer<typeof userOAuthSuccessReplySchema>
export type UserOAuthErrorOutput = z.infer<typeof errorReplySchema>

const schemaExamples = {
  errorReplySchemaExample: {
    message: 'Invalid OAuth token',
    code: 'INVALID_OAUTH_TOKEN',
  } as UserOAuthErrorOutput,
}

export const { schemas: userOAuthSchemas, $ref: userOAuthRef } =
  buildJsonSchemas(
    {
      userOAuthBodySchema,
      userOAuthSuccessReplySchema,
      errorReplySchema,
    },
    { $id: 'userOAuthSchemas', target: 'openApi3' },
  )

bindExamples(userOAuthSchemas, schemaExamples)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'User OAuth sign-in (Google, Apple, Facebook)',
  summary: 'Authenticate with OAuth provider and get access token',
  operationId: 'userOAuth',
  body: userOAuthRef('userOAuthBodySchema'),
  response: {
    '2xx': userOAuthRef('userOAuthSuccessReplySchema'),
    '4xx': userOAuthRef('errorReplySchema'),
    '5xx': userOAuthRef('errorReplySchema'),
  },
}
