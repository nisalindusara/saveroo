// The one way the web server calls the Saveroo API.
// Deployed: goes through the `API` service binding, because Cloudflare blocks a Worker from
// fetching another Worker's workers.dev URL (error 1042). Local dev: plain fetch to API_URL.
import { env } from 'cloudflare:workers';
import { dev } from '$app/env';
import { API_URL } from '$app/env/private';

/** Fetches `path` (for example `/health`) from the API. */
export function apiFetch(path: string): Promise<Response> {
	const url = `${API_URL}${path}`;
	const init = { signal: AbortSignal.timeout(5000) };
	return dev ? fetch(url, init) : env.API.fetch(url, init);
}
