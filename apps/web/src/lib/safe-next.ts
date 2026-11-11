// Cleans the "where to go after signing in" value so it can only point inside Saveroo.
// Used by the login page and the auth callback (stops redirects to other websites).
export function safeNext(value: unknown): string {
	if (typeof value !== 'string') return '/';
	if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
	return value;
}
