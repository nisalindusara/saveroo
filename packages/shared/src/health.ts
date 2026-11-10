// Shape of the API `/health` response.
// Returned by apps/api and read by the web hello page.
import { z } from 'zod';
import { apiResponseSchema } from './api';

export const healthSchema = z.object({
	status: z.literal('ok'),
	// Whether the API can reach Supabase; `not_configured` means the env vars are missing.
	database: z.enum(['ok', 'unreachable', 'not_configured']),
	time: z.iso.datetime()
});

export type Health = z.infer<typeof healthSchema>;

export const healthResponseSchema = apiResponseSchema(healthSchema);
