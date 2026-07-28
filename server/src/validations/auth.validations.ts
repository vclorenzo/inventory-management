import { z } from 'zod';

export const signupSchema = z.object({
  name: z.string().min(2).max(255).trim(),
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(6).max(128).trim(),
  role: z.enum(['user', 'admin']).default('user'),
});
export const signinSchema = z.object({
  email: z.email().max(255).toLowerCase().trim(),
  password: z.string().min(1),
});

const strongPasswordSchema = z
  .string()
  .trim()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must include one uppercase letter')
  .regex(/[a-z]/, 'Password must include one lowercase letter')
  .regex(/\d/, 'Password must include one number')
  .regex(/[^A-Za-z0-9]/, 'Password must include one special character');

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: strongPasswordSchema,
});
