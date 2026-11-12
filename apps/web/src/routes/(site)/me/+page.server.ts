// "Me" page data: whether the signed-in user is an admin (to show the admin link).
import type { Me } from '@saveroo/shared';
import { apiCall } from '#lib/server/api.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, setHeaders }) => {
	setHeaders({ 'Cache-Control': 'private, no-store' });
	const session = await locals.getSession();
	if (!session) return { isAdmin: false };
	const me = await apiCall<Me>(session, '/me');
	return { isAdmin: me.data?.role === 'admin' };
};
