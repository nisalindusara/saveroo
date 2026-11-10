// Home page data: for now, the API health check (M0 hello page).
// Calls the API from the server and validates the reply with the shared zod schema.
import { healthResponseSchema, type Health } from '@saveroo/shared';
import { apiFetch } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let health: Health | null;
	try {
		const res = await apiFetch('/health');
		health = healthResponseSchema.parse(await res.json()).data;
	} catch (error) {
		console.error('API health check failed', error);
		health = null;
	}
	return { health };
};
