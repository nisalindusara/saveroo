// CSV import: upload a CSV file of deals; all rows are created as drafts, or an error list comes back.
import { fail } from '@sveltejs/kit';
import type { CsvImportResult } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import { adminSession } from '#lib/server/admin.js';
import type { Actions } from './$types';

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
