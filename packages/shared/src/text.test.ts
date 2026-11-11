// Tests for slugify() and parseCsv() in text.ts.
import { describe, expect, it } from 'vitest';
import { parseCsv, slugify } from './text';

describe('slugify', () => {
	it('makes lowercase hyphenated slugs', () => {
		expect(slugify('Keells Super – Nugegoda!')).toBe('keells-super-nugegoda');
		expect(slugify('  Café & Bakery  ')).toBe('cafe-and-bakery');
	});

	it('returns an empty string when nothing usable remains (e.g. Sinhala only)', () => {
		expect(slugify('කීල්ස්')).toBe('');
	});

	it('cuts long text without a trailing hyphen', () => {
		expect(slugify('aaa bbb', 4)).toBe('aaa');
	});
});

describe('parseCsv', () => {
	it('reads quoted cells, escaped quotes, commas and Windows line ends', () => {
		const text = 'title,terms\r\n"50% off, Tuesdays","Say ""SAVE"" at the till"\r\nPlain,\r\n';
		expect(parseCsv(text)).toEqual([
			['title', 'terms'],
			['50% off, Tuesdays', 'Say "SAVE" at the till'],
			['Plain', '']
		]);
	});

	it('keeps line breaks inside quotes and skips blank lines', () => {
		expect(parseCsv('a,b\n"line 1\nline 2",x\n\n')).toEqual([
			['a', 'b'],
			['line 1\nline 2', 'x']
		]);
	});

	it('ignores a byte-order mark from Excel', () => {
		expect(parseCsv(String.fromCharCode(0xfeff) + 'name\nX')).toEqual([['name'], ['X']]);
	});
});
