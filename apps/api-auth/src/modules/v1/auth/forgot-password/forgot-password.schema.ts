import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

export const userForgotPasswordBodySchema = z.object({
  email: z.string().email(),
})

export const userForgotPasswordSuccessReplySchema = z.object({
  message: z.string(),
})

export type UserForgotPasswordInput = z.infer<
  typeof userForgotPasswordBodySchema
>
export type UserForgotPasswordSuccessOutput = z.infer<
  typeof userForgotPasswordSuccessReplySchema
>
export type UserForgotPasswordErrorOutput = z.infer<typeof errorReplySchema>

export const {
  schemas: userForgotPasswordSchemas,
  $ref: userForgotPasswordRef,
} = buildJsonSchemas(
  {
    userForgotPasswordBodySchema,
    userForgotPasswordSuccessReplySchema,
    errorReplySchema,
  },
  { $id: 'userForgotPasswordSchemas', target: 'openApi3' },
)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'Request a password reset email for a user account',
  summary: 'Send a password reset email for user account',
  operationId: 'userForgotPassword',
  body: userForgotPasswordRef('userForgotPasswordBodySchema'),
  response: {
    '2xx': userForgotPasswordRef('userForgotPasswordSuccessReplySchema'),
    '4xx': userForgotPasswordRef('errorReplySchema'),
    '5xx': userForgotPasswordRef('errorReplySchema'),
  },
}
