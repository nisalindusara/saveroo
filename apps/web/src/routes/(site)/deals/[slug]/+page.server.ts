// Deal page data: the deal (404 when it ended or does not exist) and more deals from the same merchant.
import { error } from '@sveltejs/kit';
import { t } from '@saveroo/shared/i18n';
import type { PublicDeal, PublicDealCard } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const deal = await apiGet<PublicDeal>(`/deals/${encodeURIComponent(params.slug)}`);
	if (deal.status === 404) error(404, t('pub.deal.gone'));
	if (!deal.data) error(502, deal.error?.message ?? 'Could not load this deal.');

	const more = await apiGet<PublicDealCard[]>(`/merchants/${deal.data.merchant.slug}/deals`);
	setHeaders({ 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' });
	return {
		deal: deal.data,
		more: (more.data ?? []).filter((d) => d.id !== deal.data!.id).slice(0, 10)
	};
};
