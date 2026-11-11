// POST /admin/images (same site): passes an image upload from the admin's browser to the API,
// adding the admin's login token. The API checks the role, size and format.
import { json } from '@sveltejs/kit';
import { apiCall } from '#lib/server/api.js';
import { adminSession } from '#lib/server/admin.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, url }) => {
	const session = await adminSession(locals, url.pathname);
	const form = await request.formData();
	const result = await apiCall<{ key: string }>(session, '/admin/images', { body: form, timeoutMs: 30_000 });
	return json({ data: result.data, error: result.error }, { status: result.status });
};
