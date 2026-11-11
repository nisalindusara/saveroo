// Audit log: every admin change and automatic expiry, newest first; optionally for one deal or merchant.
import type { AuditEntry } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const params = new URLSearchParams();
	for (const key of ['entityType', 'entityId', 'before']) {
		const value = url.searchParams.get(key);
		if (value) params.set(key, value);
	}
	const result = await apiCall<AuditEntry[]>(session, `/admin/audit?${params}`);
	if (!result.data) failLoad(result);
	return { entries: result.data, nextCursor: result.nextCursor ?? null, filtered: params.has('entityId') };
};
