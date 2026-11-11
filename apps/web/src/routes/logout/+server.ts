// Logs out on this device (clears the login cookies) and returns to the home page.
// Called by the "Log out" form in the site header (POST only).
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	await locals.supabase.auth.signOut({ scope: 'local' });
	redirect(303, '/');
};
