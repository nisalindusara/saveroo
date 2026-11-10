// GET /health: reports that the API is up and whether Supabase is reachable.
// Used by the web hello page, uptime checks and the deploy smoke test.
import { Hono } from 'hono';
import type { ApiResponse, Health } from '@saveroo/shared';
import { readSupabaseEnv, type Bindings, type SupabaseEnv } from './env';

async function checkDatabase(supabase: SupabaseEnv | null): Promise<Health['database']> {
	if (!supabase) return 'not_configured';
	try {
		const res = await fetch(`${supabase.SUPABASE_URL}/auth/v1/health`, {
			headers: { apikey: supabase.SUPABASE_SECRET_KEY },
			signal: AbortSignal.timeout(3000)
		});
		return res.ok ? 'ok' : 'unreachable';
	} catch {
		return 'unreachable';
	}
}

export const health = new Hono<{ Bindings: Bindings }>().get('/', async (c) => {
	const body: ApiResponse<Health> = {
		data: {
			status: 'ok',
			database: await checkDatabase(readSupabaseEnv(c.env)),
			time: new Date().toISOString()
		},
		error: null
	};
	c.header('Cache-Control', 'no-store');
	return c.json(body);
});
