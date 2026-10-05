import { userSchema } from '@app/common';
import { z } from 'zod';

/**
 * Sign In Form Schema
 */
export const signInSchema = userSchema
  .pick({
    email: true,
  })
  .extend({
    password: z
      .string({ message: 'Password is required' })
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
  });

export type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * Sign Up Form Schema
 */
export const signUpSchema = userSchema
  .pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
  })
  .extend({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    password: z
      .string({ message: 'Password is required' })
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

/**
 * Forgot Password Form Schema
 */
export const forgotPasswordSchema = userSchema.pick({
  email: true,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Form Schema
 */
export const resetPasswordSchema = z
  .object({
    code: z
      .string({ message: 'Code is required' })
      .min(1, 'Code is required')
      .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
    password: z
      .string({ message: 'Password is required' })
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string({ message: 'Please confirm your password' })
      .min(1, 'Please confirm your password')
      .min(8, 'Password must be at least 8 characters'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

/**
 * Verify Email Form Schema
 */
export const verifyEmailSchema = z.object({
  code: z
    .string({ message: 'Code is required' })
    .min(1, 'Code is required')
    .regex(/^\d{6}$/, 'Enter the 6-digit code from your email'),
});

export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
