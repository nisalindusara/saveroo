// Data for every page: who is signed in (email only), for the header.
// Uses the verified session from hooks.server.ts.
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.getSession();
	return { user: session ? { email: session.email } : null };
};
