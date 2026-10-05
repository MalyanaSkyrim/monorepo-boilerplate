import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

import { bindExamples } from '../../../../utils/swagger'

export const userSignupBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
})

export const userSignupSuccessReplySchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string().nullable(),
    phone: z.string().nullable(),
    emailVerified: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  }),
})

export type UserSignupInput = z.infer<typeof userSignupBodySchema>
export type UserSignupSuccessOutput = z.infer<
  typeof userSignupSuccessReplySchema
>
export type UserSignupErrorOutput = z.infer<typeof errorReplySchema>

const schemaExamples = {
  errorReplySchemaExample: {
    message: 'Email already exists',
    code: 'EMAIL_ALREADY_EXISTS',
  } as UserSignupErrorOutput,
}

export const { schemas: userSignupSchemas, $ref: userSignupRef } =
  buildJsonSchemas(
    {
      userSignupBodySchema,
      userSignupSuccessReplySchema,
      errorReplySchema,
    },
    { $id: 'userSignupSchemas', target: 'openApi3' },
  )

bindExamples(userSignupSchemas, schemaExamples)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'User signup',
  summary: 'Create a new user account',
  operationId: 'userSignup',
  body: userSignupRef('userSignupBodySchema'),
  response: {
    '2xx': userSignupRef('userSignupSuccessReplySchema'),
    '4xx': userSignupRef('errorReplySchema'),
    '5xx': userSignupRef('errorReplySchema'),
  },
}
