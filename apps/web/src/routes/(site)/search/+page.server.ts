// Search page data: matching shops and deals for ?q= (typo tolerant, via the API), and categories
// for the empty state.
import type { PublicCategory, PublicDealCard, PublicMerchantMatch } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const q = (url.searchParams.get('q') ?? '').trim().slice(0, 100);
	const [results, categories] = await Promise.all([
		q.length >= 2
			? apiGet<{ merchants: PublicMerchantMatch[]; deals: PublicDealCard[] }>(`/search?q=${encodeURIComponent(q)}`)
			: Promise.resolve(null),
		apiGet<PublicCategory[]>('/categories')
	]);
	setHeaders({ 'Cache-Control': 'public, max-age=30' });
	return {
		q,
		merchants: results?.data?.merchants ?? [],
		deals: results?.data?.deals ?? [],
		nextCursor: results?.nextCursor ?? null,
		failed: results !== null && !results.data,
		categories: (categories.data ?? []).map((c) => ({ slug: c.slug, name: c.name }))
	};
};
