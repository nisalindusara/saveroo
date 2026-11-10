// Home page data: for now, the API health check (M0 hello page).
// Calls the API from the server and validates the reply with the shared zod schema.
import { API_URL } from '$app/env/private';
import { healthResponseSchema, type Health } from '@saveroo/shared';
import type { PageServerLoad } from './$types';

async function fetchHealth(fetch: typeof globalThis.fetch): Promise<Health | null> {
	try {
		const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(5000) });
		return healthResponseSchema.parse(await res.json()).data;
	} catch {
		return null;
	}
}

export const load: PageServerLoad = async ({ fetch }) => {
	return { health: await fetchHealth(fetch) };
};
