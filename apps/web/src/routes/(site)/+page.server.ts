// Home page data: deals valid today, ending soon, the newest deals and categories (two API calls,
// both cached by the API for a minute or more).
import { error } from '@sveltejs/kit';
import type { PublicCategory, PublicHome } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const [home, categories] = await Promise.all([
		apiGet<PublicHome>('/home'),
		apiGet<PublicCategory[]>('/categories')
	]);
	if (!home.data) error(home.status === 200 ? 502 : home.status, home.error?.message ?? 'Could not load deals.');
	setHeaders({ 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' });
	return { home: home.data, categories: categories.data ?? [] };
};
