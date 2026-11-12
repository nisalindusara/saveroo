// Category list data (cached by the API for 5 minutes).
import { error } from '@sveltejs/kit';
import type { PublicCategory } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const categories = await apiGet<PublicCategory[]>('/categories');
	if (!categories.data) error(502, categories.error?.message ?? 'Could not load categories.');
	setHeaders({ 'Cache-Control': 'public, max-age=300' });
	return { categories: categories.data };
};
