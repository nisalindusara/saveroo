// CSV import: upload a CSV file of deals; all rows are created as drafts, or an error list comes back.
// The page also lists the merchant, bank and category codes (slugs) the file must use.
import { fail } from '@sveltejs/kit';
import type { AdminMerchantListItem, AdminReference, CsvImportResult } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession, failLoad } from '#lib/server/admin.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const [merchants, reference] = await Promise.all([
		apiCall<AdminMerchantListItem[]>(session, '/admin/merchants'),
		apiCall<AdminReference>(session, '/admin/reference')
	]);
	if (!merchants.data) failLoad(merchants);
	if (!reference.data) failLoad(reference);
	return {
		merchants: merchants.data.map((m) => ({ slug: m.slug, name: m.name })),
		providers: reference.data.providers.map((p) => ({ slug: p.slug, name: p.name })),
		categories: reference.data.categories.map((c) => ({ slug: c.slug, name: c.name }))
	};
};

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const session = await adminSession(locals, url.pathname);
		const file = (await request.formData()).get('file');
		if (!(file instanceof File) || file.size === 0) {
			return fail(400, { message: 'Choose a CSV file.', result: null });
		}
		if (file.size > 1_000_000) return fail(413, { message: 'The file is larger than 1 MB.', result: null });
		const result = await apiCall<CsvImportResult>(session, '/admin/import/deals', {
			body: { csv: await file.text() },
			timeoutMs: 30_000
		});
		if (!result.data) return fail(result.status, { message: result.error?.message ?? 'Import failed.', result: null });
		return { message: null, result: result.data };
	}
};
