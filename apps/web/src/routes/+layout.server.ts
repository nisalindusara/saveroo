// Data for every page: who is signed in (email only), the image base address (public bucket) and
// today's weekday in Colombo (1 = Mon .. 7 = Sun) for "valid today" labels.
import { colomboDayOfWeek } from '@saveroo/shared/time';
import { SUPABASE_URL } from '$app/env/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	return {
		user: session ? { email: session.email } : null,
		supabaseUrl: SUPABASE_URL,
		today: colomboDayOfWeek()
	};
};
