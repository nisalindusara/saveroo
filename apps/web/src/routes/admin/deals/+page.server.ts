// Admin deal list: filter by status, search by title, page with "Older" (cursor).
import type { AdminDealListItem } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const params = new URLSearchParams();
	for (const key of ['status', 'q', 'cursor', 'merchantId']) {
		const value = url.searchParams.get(key);
		if (value) params.set(key, value);
	}
	const result = await apiCall<AdminDealListItem[]>(session, `/admin/deals?${params}`);
	if (!result.data) failLoad(result);
	return {
		deals: result.data,
		nextCursor: result.nextCursor ?? null,
		status: url.searchParams.get('status') ?? '',
		q: url.searchParams.get('q') ?? ''
	};
};
