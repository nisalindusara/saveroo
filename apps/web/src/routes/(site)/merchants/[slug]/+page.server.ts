// Merchant page data: details and branches, and the merchant's live deals (first page).
import { error } from '@sveltejs/kit';
import { t } from '@saveroo/shared/i18n';
import type { PublicDealCard, PublicMerchant } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const slug = encodeURIComponent(params.slug);
	const [merchant, deals] = await Promise.all([
		apiGet<PublicMerchant>(`/merchants/${slug}`),
		apiGet<PublicDealCard[]>(`/merchants/${slug}/deals`)
	]);
	if (merchant.status === 404) error(404, t('pub.merchant.not_found'));
	if (!merchant.data) error(502, merchant.error?.message ?? 'Could not load this shop.');
	setHeaders({ 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' });
	return { merchant: merchant.data, deals: deals.data ?? [], nextCursor: deals.nextCursor ?? null };
};
