import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

import { bindExamples } from '../../../../utils/swagger'

export const userVerifyEmailBodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/),
})

// Mirrors userSigninSuccessReplySchema: verifying signs the user in.
export const userVerifyEmailSuccessReplySchema = z.object({
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

export type UserVerifyEmailInput = z.infer<typeof userVerifyEmailBodySchema>
export type UserVerifyEmailSuccessOutput = z.infer<
  typeof userVerifyEmailSuccessReplySchema
>
export type UserVerifyEmailErrorOutput = z.infer<typeof errorReplySchema>

const schemaExamples = {
  errorReplySchemaExample: {
    message: 'Invalid or expired verification code',
    code: 'INVALID_VERIFICATION_CODE',
  } as UserVerifyEmailErrorOutput,
}

export const { schemas: userVerifyEmailSchemas, $ref: userVerifyEmailRef } =
  buildJsonSchemas(
    {
      userVerifyEmailBodySchema,
      userVerifyEmailSuccessReplySchema,
      errorReplySchema,
    },
    { $id: 'userVerifyEmailSchemas', target: 'openApi3' },
  )

bindExamples(userVerifyEmailSchemas, schemaExamples)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'Verify user email',
  summary: 'Confirm a user email with a 6-digit code and sign them in',
  operationId: 'userVerifyEmail',
  body: userVerifyEmailRef('userVerifyEmailBodySchema'),
  response: {
    '2xx': userVerifyEmailRef('userVerifyEmailSuccessReplySchema'),
    '4xx': userVerifyEmailRef('errorReplySchema'),
    '5xx': userVerifyEmailRef('errorReplySchema'),
  },
}
