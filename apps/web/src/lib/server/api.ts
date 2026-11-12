// The one way the web server calls the Saveroo API.
// Deployed: goes through the `API` service binding, because Cloudflare blocks a Worker from
// fetching another Worker's workers.dev URL (error 1042). Local dev: plain fetch to API_URL.
import { env } from 'cloudflare:workers';
import { dev } from '$app/env';
import { API_URL } from '$app/env/private';
import type { ApiError } from '@saveroo/shared';

type ApiFetchOptions = {
	accessToken?: string;
	method?: 'GET' | 'POST';
	/** A plain object is sent as JSON; FormData is sent as a form upload. */
	body?: unknown;
	timeoutMs?: number;
};

/** Fetches `path` (for example `/me`) from the API, as the signed-in user when a token is given. */
export function apiFetch(path: string, options: ApiFetchOptions = {}): Promise<Response> {
	const url = `${API_URL}${path}`;
	const headers: Record<string, string> = options.accessToken
		? { Authorization: `Bearer ${options.accessToken}` }
		: {};
	let body: BodyInit | undefined;
	if (options.body instanceof FormData) {
		body = options.body;
	} else if (options.body !== undefined) {
		body = JSON.stringify(options.body);
		headers['Content-Type'] = 'application/json';
	}
	const init = {
		method: options.method ?? (body ? 'POST' : 'GET'),
		headers,
		body,
		signal: AbortSignal.timeout(options.timeoutMs ?? 10_000)
	};
	return dev ? fetch(url, init) : env.API.fetch(url, init);
}

export type ApiResult<T> = { status: number; data: T | null; error: ApiError | null; nextCursor?: string | null };

/** apiFetch as the signed-in user, reading the `{ data, error }` reply. Network failures become an error. */
export async function apiCall<T>(
	session: Session,
	path: string,
	options: Omit<ApiFetchOptions, 'accessToken'> = {}
): Promise<ApiResult<T>> {
	try {
		const res = await apiFetch(path, { ...options, accessToken: session.accessToken });
		const json = (await res.json()) as { data: T | null; error: ApiError | null; nextCursor?: string | null };
		return { status: res.status, data: json.data, error: json.error, nextCursor: json.nextCursor };
	} catch (e) {
		console.error('API call failed', path, e);
		return { status: 503, data: null, error: { code: 'api_unreachable', message: 'The server is not responding. Please try again.' } };
	}
}

/** Public (no sign-in) API read, reading the `{ data, error }` reply. Network failures become an error. */
export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
	try {
		const res = await apiFetch(path);
		const json = (await res.json()) as { data: T | null; error: ApiError | null; nextCursor?: string | null };
		return { status: res.status, data: json.data, error: json.error, nextCursor: json.nextCursor };
	} catch (e) {
		console.error('API call failed', path, e);
		return { status: 503, data: null, error: { code: 'api_unreachable', message: 'The server is not responding. Please try again.' } };
	}
}
