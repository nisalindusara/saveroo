// Where the email sign-in link and Google send people back: swaps the one-time code for a
// session (stored in cookies), then continues to the page they wanted.
import { redirect } from '@sveltejs/kit';
import { safeNext } from '#lib/safe-next.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, safeNext(url.searchParams.get('next')));
		console.error('Auth callback failed:', error.code ?? error.name, error.message);
	} else {
		console.error('Auth callback without code:', url.searchParams.get('error_description'));
	}
	redirect(303, '/login?error=callback');
};
