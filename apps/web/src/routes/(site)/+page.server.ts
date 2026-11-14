// Home page data: deals valid today, ending soon, the newest deals and counts (one API call, cached by
// the API for a minute). Categories come from the (site) layout.
import { error } from '@sveltejs/kit';
import type { PublicHome } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	const home = await apiGet<PublicHome>('/home');
	if (!home.data) error(home.status === 200 ? 502 : home.status, home.error?.message ?? 'Could not load deals.');
	setHeaders({ 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' });
	return { home: home.data };
};
