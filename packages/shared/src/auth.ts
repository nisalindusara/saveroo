// Schemas for signing in and for the signed-in user (`GET /me`).
// Used by the web login form and by the API's /me endpoint and its callers.
import { z } from 'zod';
import { apiResponseSchema } from './api';

export const userRoleSchema = z.enum(['user', 'moderator', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const loginEmailSchema = z.object({
	email: z.email().trim().toLowerCase().max(254)
});

export const meSchema = z.object({
	id: z.uuid(),
	email: z.string().nullable(),
	role: userRoleSchema,
	displayName: z.string().nullable(),
	onboardingDone: z.boolean()
});
export type Me = z.infer<typeof meSchema>;

export const meResponseSchema = apiResponseSchema(meSchema);
