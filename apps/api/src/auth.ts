// Checks the Supabase login token on API requests and loads the user's profile and role.
// `requireUser` guards routes for signed-in users; `requireAdmin` guards admin routes.
import { createMiddleware } from 'hono/factory';
import { verifyWithJwks } from 'hono/jwt';
import type { HonoJsonWebKey } from 'hono/utils/jwt/jws';
import type { Me } from '@saveroo/shared';
import { getDb, type Db } from './db';
import { errorResponse } from './errors';
import { readSupabaseEnv, type Bindings } from './env';

/** `user`: the verified signed-in user. `db`: the API database client (secret key). */
export type AuthEnv = { Bindings: Bindings; Variables: { user: Me; db: Db } };

// Supabase's public signing keys, fetched once and reused for 10 minutes per Worker instance.
const KEYS_TTL_MS = 10 * 60 * 1000;
let keysCache: { url: string; keys: HonoJsonWebKey[]; fetchedAt: number } | null = null;

async function getSigningKeys(supabaseUrl: string): Promise<HonoJsonWebKey[]> {
	const url = `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
	if (keysCache?.url === url && Date.now() - keysCache.fetchedAt < KEYS_TTL_MS) {
		return keysCache.keys;
	}
	const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
	if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
	const { keys } = (await res.json()) as { keys: HonoJsonWebKey[] };
	keysCache = { url, keys, fetchedAt: Date.now() };
	return keys;
}

/** Test helper: forget cached signing keys. */
export function clearSigningKeysCache() {
	keysCache = null;
}

export const requireUser = createMiddleware<AuthEnv>(async (c, next) => {
	const supabase = readSupabaseEnv(c.env);
	if (!supabase) return errorResponse(c, 503, 'not_configured', 'Sign-in is not configured.');

	const token = c.req.header('Authorization')?.match(/^Bearer (.+)$/)?.[1];
	if (!token) return errorResponse(c, 401, 'unauthorized', 'Please sign in.');

	let userId: string;
	let email: string | null;
	try {
		const payload = await verifyWithJwks(token, {
			keys: await getSigningKeys(supabase.SUPABASE_URL),
			allowedAlgorithms: ['ES256', 'RS256'],
			verification: { iss: `${supabase.SUPABASE_URL}/auth/v1`, aud: 'authenticated' }
		});
		if (typeof payload.sub !== 'string') throw new Error('Token has no subject');
		userId = payload.sub;
		email = typeof payload.email === 'string' ? payload.email : null;
	} catch {
		return errorResponse(c, 401, 'unauthorized', 'Your session has expired. Please sign in again.');
	}

	const db = getDb(supabase);
	const { data: profile, error } = await db
		.from('profiles')
		.select('role, display_name, onboarding_done')
		.eq('id', userId)
		.maybeSingle();
	if (error) return errorResponse(c, 500, 'internal', 'Could not load your profile.');
	if (!profile) return errorResponse(c, 401, 'unauthorized', 'Please sign in again.');

	c.set('db', db);
	c.set('user', {
		id: userId,
		email,
		role: profile.role,
		displayName: profile.display_name,
		onboardingDone: profile.onboarding_done
	});
	await next();
});

export const requireAdmin = createMiddleware<AuthEnv>(async (c, next) => {
	if (c.get('user').role !== 'admin') {
		return errorResponse(c, 403, 'forbidden', 'Admins only.');
	}
	await next();
});
