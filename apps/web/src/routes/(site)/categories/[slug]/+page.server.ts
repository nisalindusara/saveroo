// Category page data: the category (with sub-categories and siblings for the chips) and its deals.
import { error } from '@sveltejs/kit';
import { t } from '@saveroo/shared/i18n';
import type { PublicCategory, PublicDealCard } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const [categories, deals] = await Promise.all([
		apiGet<PublicCategory[]>('/categories'),
		apiGet<PublicDealCard[]>(`/categories/${encodeURIComponent(params.slug)}`)
	]);
	if (deals.status === 404) error(404, t('pub.categories.not_found'));
	if (!categories.data || !deals.data) error(502, 'Could not load this category.');

	const all = categories.data;
	const top = all.find((c) => c.slug === params.slug || c.children.some((x) => x.slug === params.slug))!;
	const current = top.slug === params.slug ? top : top.children.find((x) => x.slug === params.slug)!;
	setHeaders({ 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' });
	return {
		category: { slug: current.slug, name: current.name },
		parent: top.slug === params.slug ? null : { slug: top.slug, name: top.name },
		children: top.children,
		others: all.map((c) => ({ slug: c.slug, name: c.name })),
		deals: deals.data,
		nextCursor: deals.nextCursor ?? null
	};
};
