// Admin dashboard data: counts plus deals expiring soon, due for a recheck, and recent drafts.
import type { AdminDashboard } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const result = await apiCall<AdminDashboard>(session, '/admin/dashboard');
	if (!result.data) failLoad(result);
	return { dashboard: result.data };
};
