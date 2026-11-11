// Edit merchant page: loads the merchant (with branches) and categories; saves through the API.
import { fail } from '@sveltejs/kit';
import type { AdminMerchant, AdminReference } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad, readPayload } from '#lib/server/admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const session = await adminSession(locals, url.pathname);
	const [merchant, reference] = await Promise.all([
		apiCall<AdminMerchant>(session, `/admin/merchants/${params.id}`),
		apiCall<AdminReference>(session, '/admin/reference')
	]);
	if (!merchant.data) failLoad(merchant);
	if (!reference.data) failLoad(reference);
	return { merchant: merchant.data, categories: reference.data.categories, saved: url.searchParams.has('saved') };
};

export const actions: Actions = {
	save: async ({ request, locals, url }) => {
		const session = await adminSession(locals, url.pathname);
		const result = await apiCall<{ id: string }>(session, '/admin/merchants', { body: await readPayload(request) });
		if (!result.data) return fail(result.status, { error: result.error });
		return { saved: true };
	}
};
