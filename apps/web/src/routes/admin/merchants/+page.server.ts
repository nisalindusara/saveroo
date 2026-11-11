// Admin merchant list (with name search).
import type { AdminMerchantListItem } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const q = url.searchParams.get('q') ?? '';
	const result = await apiCall<AdminMerchantListItem[]>(session, `/admin/merchants?q=${encodeURIComponent(q)}`);
	if (!result.data) failLoad(result);
	return { merchants: result.data, q };
};
