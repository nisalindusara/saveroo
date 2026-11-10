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
	'health.api_down': 'The API is not responding.'
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
