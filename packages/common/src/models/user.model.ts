import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  password: z.string().nullable().optional(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  // Optional as well as nullable so clients stay compatible with a server
  // that predates email verification.
  emailVerified: z.coerce.date().nullable().optional(),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
})

export type User = z.infer<typeof userSchema>
