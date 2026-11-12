// Login page actions: email sign-in link (magic link) and Google sign-in, both via Supabase Auth.
// Signed-in visitors are sent straight on to where they were going.
import { fail, redirect } from '@sveltejs/kit';
import { loginEmailSchema } from '@saveroo/shared';
import { SUPABASE_URL } from '$app/env/private';
import { safeNext } from '#lib/safe-next.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (await locals.getSession()) redirect(303, next);
	return { next, callbackFailed: url.searchParams.get('error') === 'callback' };
};

function callbackUrl(origin: string, next: string) {
	return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export const actions: Actions = {
	email: async ({ request, locals, url }) => {
		const form = await request.formData();
		const next = safeNext(form.get('next'));
		const parsed = loginEmailSchema.safeParse({ email: form.get('email') });
		if (!parsed.success) {
			return fail(400, { email: String(form.get('email') ?? ''), error: 'invalid_email' as const });
		}
		const { error } = await locals.supabase.auth.signInWithOtp({
			email: parsed.data.email,
			options: { emailRedirectTo: callbackUrl(url.origin, next) }
		});
		if (error) {
			const tooMany = error.status === 429;
			return fail(tooMany ? 429 : 500, {
				email: parsed.data.email,
				error: tooMany ? ('too_many' as const) : ('send_failed' as const)
			});
		}
		return { sent: true, email: parsed.data.email };
	},

	google: async ({ request, locals, url }) => {
		const next = safeNext((await request.formData()).get('next'));
		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider: 'google',
			options: { redirectTo: callbackUrl(url.origin, next), skipBrowserRedirect: true }
		});
		if (error || !data.url) return fail(500, { email: '', error: 'google_failed' as const });
		redirect(303, data.url, { external: [new URL(SUPABASE_URL).origin] });
	}
};
