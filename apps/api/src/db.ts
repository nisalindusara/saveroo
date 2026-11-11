// The API's database client: supabase-js with the secret key (bypasses Row Level Security).
// Used by every route that reads or writes the database; the key never leaves this Worker.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@saveroo/shared';
import type { SupabaseEnv } from './env';

export type Db = SupabaseClient<Database>;

let cached: { key: string; client: Db } | null = null;

export function getDb(env: SupabaseEnv): Db {
	const key = `${env.SUPABASE_URL}|${env.SUPABASE_SECRET_KEY}`;
	if (cached?.key !== key) {
		cached = {
			key,
			client: createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
				auth: { persistSession: false, autoRefreshToken: false }
			})
		};
	}
	return cached.client;
}
