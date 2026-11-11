// Runs on every server request: creates the Supabase client that reads and writes the login cookies,
// and `locals.getSession()`, which verifies the login token before anything trusts it.
import { createServerClient } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit/hooks';
import type { Database } from '@saveroo/shared';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '$app/env/private';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		cookieOptions: { httpOnly: true, sameSite: 'lax' },
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				for (const { name, value, options } of cookies) {
					event.cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});
	event.locals.supabase = supabase;

	let session: Promise<Session | null> | undefined;
	event.locals.getSession = () => {
		session ??= (async () => {
			// getClaims() checks the token's signature; getSession() alone only reads the cookie.
			const { data, error } = await supabase.auth.getClaims();
			if (error || !data) return null;
			const {
				data: { session: current }
			} = await supabase.auth.getSession();
			if (!current) return null;
			return {
				userId: data.claims.sub,
				email: data.claims.email ?? null,
				accessToken: current.access_token
			};
		})();
		return session;
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) =>
			name === 'content-range' || name === 'x-supabase-api-version'
	});
};
