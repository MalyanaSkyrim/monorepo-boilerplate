import { errorReplySchema } from '@app/common'
import { buildJsonSchemas } from '@app/common/server'
import { FastifySchema } from 'fastify'
import { z } from 'zod'

import { bindExamples } from '../../../../utils/swagger'

export const userProfileSuccessReplySchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string().nullable(),
  phone: z.string().nullable(),
  emailVerified: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const userUpdateProfileBodySchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
})

export type UserUpdateProfileInput = z.infer<typeof userUpdateProfileBodySchema>
export type UserProfileSuccessOutput = z.infer<
  typeof userProfileSuccessReplySchema
>
export type UserProfileErrorOutput = z.infer<typeof errorReplySchema>

const schemaExamples = {
  userProfileSuccessReplySchemaExample: {
    id: 'clxx123',
    email: 'user@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: '+1234567890',
    emailVerified: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  } as UserProfileSuccessOutput,
  errorReplySchemaExample: {
    message: 'Unauthorized',
    code: 'UNAUTHORIZED',
  } as UserProfileErrorOutput,
}

export const { schemas: userProfileSchemas, $ref: userProfileRef } =
  buildJsonSchemas(
    {
      userUpdateProfileBodySchema,
      userProfileSuccessReplySchema,
      errorReplySchema,
    },
    { $id: 'userProfileSchemas', target: 'openApi3' },
  )

bindExamples(userProfileSchemas, schemaExamples)

export const schema: FastifySchema = {
  tags: ['Auth'],
  description: 'Get user profile',
  summary: 'Get authenticated user profile',
  operationId: 'getUserProfile',
  response: {
    '2xx': userProfileRef('userProfileSuccessReplySchema'),
    '4xx': userProfileRef('errorReplySchema'),
    '5xx': userProfileRef('errorReplySchema'),
  },
}

export const updateSchema: FastifySchema = {
  tags: ['Auth'],
  description: 'Update user profile',
  summary: 'Update the authenticated user profile',
  operationId: 'updateUserProfile',
  body: userProfileRef('userUpdateProfileBodySchema'),
  response: {
    '2xx': userProfileRef('userProfileSuccessReplySchema'),
    '4xx': userProfileRef('errorReplySchema'),
    '5xx': userProfileRef('errorReplySchema'),
  },
}
