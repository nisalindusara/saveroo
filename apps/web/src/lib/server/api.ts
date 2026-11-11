// The one way the web server calls the Saveroo API.
// Deployed: goes through the `API` service binding, because Cloudflare blocks a Worker from
// fetching another Worker's workers.dev URL (error 1042). Local dev: plain fetch to API_URL.
import { env } from 'cloudflare:workers';
import { dev } from '$app/env';
import { API_URL } from '$app/env/private';

/** Fetches `path` (for example `/me`) from the API, as the signed-in user when a token is given. */
export function apiFetch(path: string, options: { accessToken?: string } = {}): Promise<Response> {
	const url = `${API_URL}${path}`;
	const headers: Record<string, string> = options.accessToken
		? { Authorization: `Bearer ${options.accessToken}` }
		: {};
	const init = { headers, signal: AbortSignal.timeout(5000) };
	return dev ? fetch(url, init) : env.API.fetch(url, init);
}
