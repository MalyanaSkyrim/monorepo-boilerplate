import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

export const userResetPasswordBodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
  password: z.string().min(8),
})

export const userResetPasswordSuccessReplySchema = z.object({
  message: z.string(),
})

export type UserResetPasswordInput = z.infer<typeof userResetPasswordBodySchema>
export type UserResetPasswordSuccessOutput = z.infer<
  typeof userResetPasswordSuccessReplySchema
>
export type UserResetPasswordErrorOutput = z.infer<typeof errorReplySchema>

export const { schemas: userResetPasswordSchemas, $ref: userResetPasswordRef } =
  buildJsonSchemas(
    {
      userResetPasswordBodySchema,
      userResetPasswordSuccessReplySchema,
      errorReplySchema,
    },
    { $id: 'userResetPasswordSchemas', target: 'openApi3' },
  )

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'Reset a user password using the 6-digit email code',
  summary: 'Update user password with email and verification code',
  operationId: 'userResetPassword',
  body: userResetPasswordRef('userResetPasswordBodySchema'),
  response: {
    '2xx': userResetPasswordRef('userResetPasswordSuccessReplySchema'),
    '4xx': userResetPasswordRef('errorReplySchema'),
    '5xx': userResetPasswordRef('errorReplySchema'),
  },
}
