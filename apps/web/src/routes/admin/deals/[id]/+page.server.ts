// Deal page: edit form plus status actions (publish, pause, resume, end), "still running" check,
// and a warning when the merchant has a similar open deal.
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import type { AdminDeal, AdminMerchant, AdminReference, DuplicateDeal } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad, readPayload } from '#lib/server/admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const session = await adminSession(locals, url.pathname);
	const id = encodeURIComponent(params.id);
	const [deal, reference, duplicates] = await Promise.all([
		apiCall<AdminDeal>(session, `/admin/deals/${id}`),
		apiCall<AdminReference>(session, '/admin/reference'),
		apiCall<DuplicateDeal[]>(session, `/admin/deals/${id}/duplicates`)
	]);
	if (!deal.data) failLoad(deal);
	if (!reference.data) failLoad(reference);
	const merchant = await apiCall<AdminMerchant>(session, `/admin/merchants/${deal.data.merchantId}`);
	if (!merchant.data) failLoad(merchant);
	return {
		deal: deal.data,
		merchant: merchant.data,
		reference: reference.data,
		duplicates: duplicates.data ?? [],
		saved: url.searchParams.has('saved')
	};
};

const statusSchema = z.enum(['live', 'paused', 'expired']);

export const actions: Actions = {
	save: async ({ request, locals, url }) => {
		const session = await adminSession(locals, url.pathname);
		const result = await apiCall<{ id: string }>(session, '/admin/deals', { body: await readPayload(request) });
		if (!result.data) return fail(result.status, { error: result.error });
		return { saved: true };
	},

	status: async ({ request, locals, url, params }) => {
		const session = await adminSession(locals, url.pathname);
		const status = statusSchema.safeParse((await request.formData()).get('status'));
		if (!status.success) return fail(400, { error: { code: 'invalid_input', message: 'Unknown status.' } });
		const result = await apiCall(session, `/admin/deals/${encodeURIComponent(params.id)}/status`, {
			body: { status: status.data }
		});
		if (result.error) return fail(result.status, { error: result.error });
		return { statusChanged: status.data };
	},

	checked: async ({ locals, url, params }) => {
		const session = await adminSession(locals, url.pathname);
		const result = await apiCall(session, `/admin/deals/${encodeURIComponent(params.id)}/checked`, { body: {} });
		if (result.error) return fail(result.status, { error: result.error });
		return { checked: true };
	}
};
