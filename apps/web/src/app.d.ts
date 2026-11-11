// Global SvelteKit types for the web app.
// Cloudflare bindings are not on `platform`: import `env` from 'cloudflare:workers' instead.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@saveroo/shared';

declare global {
	namespace App {
		interface Locals {
			/** Supabase client for this request; keeps the login in cookies. Set in hooks.server.ts. */
			supabase: SupabaseClient<Database>;
			/** The verified signed-in user for this request, or null. */
			getSession(): Promise<Session | null>;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}

	type Session = { userId: string; email: string | null; accessToken: string };
}

export {};
