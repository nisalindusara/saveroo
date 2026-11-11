// Helpers for /admin server code: the signed-in session for API calls, and reading form payloads.
// The API checks the admin role on every call; these only make the pages simpler.
import { error, redirect } from '@sveltejs/kit';

/** The session for an admin page or action; visitors are sent to log in. */
export async function adminSession(locals: App.Locals, path: string): Promise<Session> {
	const session = await locals.getSession();
	if (!session) redirect(303, `/login?next=${encodeURIComponent(path)}`);
	return session;
}

/** Reads the JSON the admin forms put in a hidden "payload" field. */
export async function readPayload(request: Request): Promise<unknown> {
	const form = await request.formData();
	try {
		return JSON.parse(String(form.get('payload') ?? 'null'));
	} catch {
		error(400, 'Invalid form data');
	}
}

/** Stops a page load when the API failed, with the API's message. */
export function failLoad(result: { status: number; error: { message: string } | null }): never {
	error(result.status >= 400 ? result.status : 502, result.error?.message ?? 'Could not load this page.');
}
