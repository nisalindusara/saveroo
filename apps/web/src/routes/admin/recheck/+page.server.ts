// Recheck queue: live deals due for a "still running?" check within 3 days, overdue first.
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { AdminDealListItem } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const result = await apiCall<AdminDealListItem[]>(session, '/admin/recheck');
	if (!result.data) failLoad(result);
	return { deals: result.data };
};

export const actions: Actions = {
	checked: async ({ request, locals, url }) => {
		const session = await adminSession(locals, url.pathname);
		const id = z.uuid().safeParse((await request.formData()).get('id'));
		if (!id.success) return fail(400, { error: { code: 'invalid_input', message: 'Unknown deal.' } });
		const result = await apiCall(session, `/admin/deals/${id.data}/checked`, { body: {} });
		if (result.error) return fail(result.status, { error: result.error });
		return { checked: true };
	}
};
