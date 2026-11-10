// Tests for the `t()` helper in i18n.ts.
import { describe, expect, it } from 'vitest';
import { t } from './i18n';

describe('t', () => {
	it('returns the English text for a key', () => {
		expect(t('app.name')).toBe('Saveroo');
	});

	it('leaves text without placeholders unchanged when params are given', () => {
		expect(t('health.ok', { unused: 1 })).toBe('Connected');
	});
});
