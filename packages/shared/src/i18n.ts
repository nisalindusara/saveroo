// The `t()` helper: every user-facing string goes through it.
// English only for now; Sinhala and Tamil message tables are added in R3.
const en = {
	'app.name': 'Saveroo',
	'app.tagline': 'The best deal, the best card and the best day, before you pay.',
	'health.api': 'API',
	'health.database': 'Database',
	'health.ok': 'Connected',
	'health.unreachable': 'Unreachable',
	'health.not_configured': 'Not configured',
	'health.api_down': 'The API is not responding.',
	'auth.login': 'Log in',
	'auth.logout': 'Log out',
	'auth.signed_in_as': 'Signed in as {email}',
	'auth.login_title': 'Log in or sign up',
	'auth.login_intro': 'Save deals, add your cards and get alerts. No password needed.',
	'auth.email_label': 'Email address',
	'auth.email_submit': 'Email me a sign-in link',
	'auth.or': 'or',
	'auth.google': 'Continue with Google',
	'auth.check_email': 'Check your email. We sent a sign-in link to {email}.',
	'auth.invalid_email': 'Please enter a valid email address.',
	'auth.too_many': 'Too many attempts. Please wait a few minutes and try again.',
	'auth.send_failed': 'We could not send the email. Please try again.',
	'auth.google_failed': 'Google sign-in is not available right now. Please use email.',
	'auth.callback_failed': 'That sign-in link did not work or has expired. Please try again.',
	'admin.title': 'Admin',
	'admin.welcome': 'You are signed in as an admin. The deal posting tools arrive in the next milestone.',
	'admin.forbidden': 'This page is for Saveroo admins only.',
	'error.back_home': 'Back to home'
} as const;

export type MessageKey = keyof typeof en;

/** Returns the text for `key`, filling `{name}` placeholders from `params`. */
export function t(key: MessageKey, params?: Record<string, string | number>): string {
	const text: string = en[key];
	if (!params) return text;
	return text.replace(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match
	);
}
