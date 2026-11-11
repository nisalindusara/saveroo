// New deal page. Step 1: pick the merchant (?merchantId=). Step 2: the deal form, which needs the
// merchant's branches and the reference lists. Saving creates a draft and opens it.
import { fail, redirect } from '@sveltejs/kit';
import type { AdminMerchant, AdminMerchantListItem, AdminReference } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad, readPayload } from '#lib/server/admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const merchantId = url.searchParams.get('merchantId');
	if (!merchantId) {
		const merchants = await apiCall<AdminMerchantListItem[]>(session, '/admin/merchants');
		if (!merchants.data) failLoad(merchants);
		return { step: 'merchant' as const, merchants: merchants.data };
	}
	const [merchant, reference] = await Promise.all([
		apiCall<AdminMerchant>(session, `/admin/merchants/${encodeURIComponent(merchantId)}`),
		apiCall<AdminReference>(session, '/admin/reference')
	]);
	if (!merchant.data) failLoad(merchant);
	if (!reference.data) failLoad(reference);
	return { step: 'form' as const, merchant: merchant.data, reference: reference.data };
};

export const actions: Actions = {
	save: async ({ request, locals, url }) => {
		const session = await adminSession(locals, url.pathname);
		const result = await apiCall<{ id: string }>(session, '/admin/deals', { body: await readPayload(request) });
		if (!result.data) return fail(result.status, { error: result.error });
		redirect(303, `/admin/deals/${result.data.id}?saved=1`);
	}
};
