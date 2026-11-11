// New merchant page: loads the category list and saves through the API, then opens the merchant.
import { fail, redirect } from '@sveltejs/kit';
import type { AdminReference } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad, readPayload } from '#lib/server/admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const reference = await apiCall<AdminReference>(session, '/admin/reference');
	if (!reference.data) failLoad(reference);
	return { categories: reference.data.categories };
};

export const actions: Actions = {
	save: async ({ request, locals, url }) => {
		const session = await adminSession(locals, url.pathname);
		const result = await apiCall<{ id: string }>(session, '/admin/merchants', { body: await readPayload(request) });
		if (!result.data) return fail(result.status, { error: result.error });
		redirect(303, `/admin/merchants/${result.data.id}?saved=1`);
	}
};
