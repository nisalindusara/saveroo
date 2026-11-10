// Reads and validates the Worker's environment (vars and secrets).
// Used by route handlers that need Supabase; returns null when not configured.
import { z } from 'zod';

const supabaseEnvSchema = z.object({
	SUPABASE_URL: z.url(),
	SUPABASE_SECRET_KEY: z.string().min(1)
});

export type SupabaseEnv = z.infer<typeof supabaseEnvSchema>;

export type Bindings = {
	SUPABASE_URL?: string;
	SUPABASE_SECRET_KEY?: string;
};

export function readSupabaseEnv(env: Bindings): SupabaseEnv | null {
	const parsed = supabaseEnvSchema.safeParse(env);
	return parsed.success ? parsed.data : null;
}
