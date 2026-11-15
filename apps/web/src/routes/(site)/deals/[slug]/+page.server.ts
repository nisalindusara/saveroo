// Deal page data: the deal (404 when it ended or does not exist). More deals from the same merchant and
// similar deals (same category) are streamed in after the page is sent, so they do not delay the first paint.
import { error } from '@sveltejs/kit';
import { t } from '@saveroo/shared/i18n';
import type { PublicDeal, PublicDealCard } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const deal = await apiGet<PublicDeal>(`/deals/${encodeURIComponent(params.slug)}`);
	if (deal.status === 404) error(404, t('pub.deal.gone'));
	if (!deal.data) error(502, deal.error?.message ?? 'Could not load this deal.');

	const id = deal.data.id;
	const more = apiGet<PublicDealCard[]>(`/merchants/${deal.data.merchant.slug}/deals`).then((r) =>
		(r.data ?? []).filter((d) => d.id !== id).slice(0, 10)
	);
	const category = deal.data.category?.slug;
	const similar = category
		? apiGet<PublicDealCard[]>(`/categories/${encodeURIComponent(category)}`).then((r) =>
				(r.data ?? []).filter((d) => d.id !== id && d.merchant.slug !== deal.data!.merchant.slug).slice(0, 12)
			)
		: Promise.resolve([] as PublicDealCard[]);
	setHeaders({ 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' });
	return { deal: deal.data, more, similar };
};
