// Tests for safeNext(): only paths inside Saveroo are allowed after sign-in.
import { describe, expect, it } from 'vitest';
import { safeNext } from './safe-next';

describe('safeNext', () => {
	it('keeps paths inside the site', () => {
		expect(safeNext('/admin')).toBe('/admin');
		expect(safeNext('/deals/abc?x=1')).toBe('/deals/abc?x=1');
	});

	it('falls back to home for other websites and junk', () => {
		expect(safeNext('https://evil.example')).toBe('/');
		expect(safeNext('//evil.example')).toBe('/');
		expect(safeNext('/\\evil.example')).toBe('/');
		expect(safeNext(null)).toBe('/');
		expect(safeNext('')).toBe('/');
	});
});
