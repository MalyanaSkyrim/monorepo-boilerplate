import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

import { bindExamples } from '../../../../utils/swagger'

export const userSigninBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const userSigninSuccessReplySchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    emailVerified: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
  accessToken: z.string(),
})

export type UserSigninInput = z.infer<typeof userSigninBodySchema>
export type UserSigninSuccessOutput = z.infer<
  typeof userSigninSuccessReplySchema
>
export type UserSigninErrorOutput = z.infer<typeof errorReplySchema>

const schemaExamples = {
  errorReplySchemaExample: {
    message: 'Invalid email or password',
    code: 'INVALID_CREDENTIALS',
  } as UserSigninErrorOutput,
}

export const { schemas: userSigninSchemas, $ref: userSigninRef } =
  buildJsonSchemas(
    {
      userSigninBodySchema,
      userSigninSuccessReplySchema,
      errorReplySchema,
    },
    { $id: 'userSigninSchemas', target: 'openApi3' },
  )

bindExamples(userSigninSchemas, schemaExamples)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'User signin',
  summary: 'Authenticate user and get access token',
  operationId: 'userSignin',
  body: userSigninRef('userSigninBodySchema'),
  response: {
    '2xx': userSigninRef('userSigninSuccessReplySchema'),
    '4xx': userSigninRef('errorReplySchema'),
    '5xx': userSigninRef('errorReplySchema'),
  },
}
