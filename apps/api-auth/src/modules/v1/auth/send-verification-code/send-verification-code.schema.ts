import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

import { bindExamples } from '../../../../utils/swagger'

export const userSendVerificationCodeBodySchema = z.object({
  email: z.string().email(),
})

export const userSendVerificationCodeSuccessReplySchema = z.object({
  message: z.string(),
})

export type UserSendVerificationCodeInput = z.infer<
  typeof userSendVerificationCodeBodySchema
>
export type UserSendVerificationCodeSuccessOutput = z.infer<
  typeof userSendVerificationCodeSuccessReplySchema
>
export type UserSendVerificationCodeErrorOutput = z.infer<
  typeof errorReplySchema
>

const schemaExamples = {
  userSendVerificationCodeSuccessReplySchemaExample: {
    message: 'A verification code has been sent to your email.',
  } as UserSendVerificationCodeSuccessOutput,
  errorReplySchemaExample: {
    message: 'Email address is already verified',
    code: 'EMAIL_ALREADY_VERIFIED',
  } as UserSendVerificationCodeErrorOutput,
}

export const {
  schemas: userSendVerificationCodeSchemas,
  $ref: userSendVerificationCodeRef,
} = buildJsonSchemas(
  {
    userSendVerificationCodeBodySchema,
    userSendVerificationCodeSuccessReplySchema,
    errorReplySchema,
  },
  { $id: 'userSendVerificationCodeSchemas', target: 'openApi3' },
)

bindExamples(userSendVerificationCodeSchemas, schemaExamples)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'Send user email verification code',
  summary: 'Email a 6-digit code to confirm a user email address',
  operationId: 'userSendVerificationCode',
  body: userSendVerificationCodeRef('userSendVerificationCodeBodySchema'),
  response: {
    '2xx': userSendVerificationCodeRef(
      'userSendVerificationCodeSuccessReplySchema',
    ),
    '4xx': userSendVerificationCodeRef('errorReplySchema'),
    '5xx': userSendVerificationCodeRef('errorReplySchema'),
  },
}
