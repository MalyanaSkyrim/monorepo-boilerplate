import { z } from 'zod'

import { userSchema } from '../../models/user.model'

export const signupBodySchema = userSchema.pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
})

export const signupOutputSchema = z.object({
  user: userSchema.omit({
    password: true,
  }),
})

export const signinBodySchema = userSchema.pick({
  email: true,
  password: true,
})

export const signinOutputSchema = z.object({
  user: userSchema.omit({
    password: true,
  }),
  accessToken: z.string(),
})

export const oauthBodySchema = z.discriminatedUnion('provider', [
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

export const sendVerificationCodeBodySchema = userSchema.pick({
  email: true,
})

export const sendVerificationCodeOutputSchema = z.object({
  message: z.string(),
})

export const verifyEmailBodySchema = z.object({
  email: userSchema.shape.email,
  code: z.string().regex(/^\d{6}$/),
})

// Verifying proves ownership of the email, so it signs the user in too.
export const verifyEmailOutputSchema = signinOutputSchema

export const profileOutputSchema = userSchema.omit({
  password: true,
})

export const updateProfileBodySchema = userSchema
  .pick({
    firstName: true,
    lastName: true,
    phone: true,
  })
  .partial()

export type SignupInput = z.infer<typeof signupBodySchema>
export type SignupOutput = z.infer<typeof signupOutputSchema>
export type SigninInput = z.infer<typeof signinBodySchema>
export type SigninOutput = z.infer<typeof signinOutputSchema>
export type OAuthInput = z.infer<typeof oauthBodySchema>
export type OAuthOutput = z.infer<typeof signinOutputSchema>
export type ProfileOutput = z.infer<typeof profileOutputSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileBodySchema>
export type SendVerificationCodeInput = z.infer<
  typeof sendVerificationCodeBodySchema
>
export type SendVerificationCodeOutput = z.infer<
  typeof sendVerificationCodeOutputSchema
>
export type VerifyEmailInput = z.infer<typeof verifyEmailBodySchema>
export type VerifyEmailOutput = z.infer<typeof verifyEmailOutputSchema>
