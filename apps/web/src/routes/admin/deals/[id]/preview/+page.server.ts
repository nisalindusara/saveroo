// Deal preview for admins: the deal with its merchant, branch, card and coupon names filled in.
import type { AdminDeal, AdminMerchant, AdminReference } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url, params }) => {
	const session = await adminSession(locals, url.pathname);
	const [deal, reference] = await Promise.all([
		apiCall<AdminDeal>(session, `/admin/deals/${encodeURIComponent(params.id)}`),
		apiCall<AdminReference>(session, '/admin/reference')
	]);
	if (!deal.data) failLoad(deal);
	if (!reference.data) failLoad(reference);
	const merchant = await apiCall<AdminMerchant>(session, `/admin/merchants/${deal.data.merchantId}`);
	if (!merchant.data) failLoad(merchant);

	const provider = (id: string) => reference.data!.providers.find((p) => p.id === id)?.name ?? '';
	const card = (id: string | null) => (id ? reference.data!.cardProducts.find((c) => c.id === id)?.name : null);
	return {
		deal: deal.data,
		merchant: merchant.data,
		cards: deal.data.eligibility.map((e) => ({
			provider: provider(e.providerId),
			card: card(e.cardProductId),
			cardType: e.cardType,
			note: e.note
		})),
		branches: merchant.data.branches.filter((b) => deal.data!.branchIds.includes(b.id)).map((b) => b.name)
	};
};
