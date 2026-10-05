import { userSchema } from '@app/common';
import { z } from 'zod';

export const personalDataSchema = userSchema
  .pick({
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
  })
  .extend({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
  });

export type PersonalDataFormValues = z.infer<typeof personalDataSchema>;
