// Scheduled jobs, run by the Cloudflare cron trigger in wrangler.jsonc (every 5 minutes).
// Expires deals past their end time; the query also keeps the free Supabase project active.
import { getDb } from './db';
import { readSupabaseEnv, type Bindings } from './env';

export async function runScheduledJobs(env: Bindings): Promise<void> {
	const supabase = readSupabaseEnv(env);
	if (!supabase) {
		console.error('Scheduled jobs skipped: Supabase is not configured');
		return;
	}
	const { data, error } = await getDb(supabase).rpc('expire_deals');
	if (error) {
		console.error('expire_deals failed', error.message);
		return;
	}
	if (data > 0) console.log(`Expired ${data} deal(s)`);
}
