// Guards every /admin page: visitors are sent to log in; signed-in users who are not admins get 403.
// The role comes from the API (`GET /me`), which reads it from the database.
import { error, redirect } from '@sveltejs/kit';
import { meResponseSchema } from '@saveroo/shared';
import { t } from '@saveroo/shared/i18n';
import { apiFetch } from '#lib/server/api.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();
	if (!session) redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);

	const res = await apiFetch('/me', { accessToken: session.accessToken });
	if (res.status === 401) redirect(303, `/login?next=${encodeURIComponent(url.pathname)}`);
	const body = meResponseSchema.safeParse(await res.json().catch(() => null));
	if (!body.success || !body.data.data) {
		console.error('Admin guard: /me failed', res.status);
		error(502, 'Could not check your account. Please try again.');
	}

	const me = body.data.data;
	if (me.role !== 'admin') error(403, t('admin.forbidden'));
	return { me };
};
