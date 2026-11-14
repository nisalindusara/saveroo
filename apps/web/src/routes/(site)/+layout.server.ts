// Data for every public page: the top-level categories for the header's category tabs and the footer
// (one cached API call; an empty list if the API is down, so pages still render).
import type { PublicCategory } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const categories = await apiGet<PublicCategory[]>('/categories');
	return {
		navCategories: (categories.data ?? []).map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))
	};
};
