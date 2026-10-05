import { z } from 'zod'

import { userSchema } from '../../models/user.model'

export const forgotPasswordBodySchema = z.object({
  email: userSchema.shape.email,
})

export const resetPasswordBodySchema = z.object({
  email: userSchema.shape.email,
  code: z.string().regex(/^\d{6}$/),
  password: z.string().min(8),
})

export const passwordResetSuccessSchema = z.object({
  message: z.string(),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordBodySchema>
export type ForgotPasswordOutput = PasswordResetSuccessOutput
export type ResetPasswordInput = z.infer<typeof resetPasswordBodySchema>
export type ResetPasswordOutput = PasswordResetSuccessOutput
export type PasswordResetSuccessOutput = z.infer<
  typeof passwordResetSuccessSchema
>
