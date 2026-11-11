// Environment variables for the web app, validated with zod when the app starts.
// Server code reads them from `$app/env/private`; locally they come from apps/web/.env.
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
	API_URL: {
		schema: z.url(),
		description: 'Base URL of the Saveroo API Worker, without a trailing slash.'
	},
	SUPABASE_URL: {
		schema: z.url(),
		description: 'Supabase project URL, used for signing in.'
	},
	SUPABASE_PUBLISHABLE_KEY: {
		schema: z.string().min(1),
		description: 'Supabase publishable key (safe to expose; access is limited by Row Level Security).'
	}
});
