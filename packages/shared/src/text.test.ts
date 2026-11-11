// Tests for parseCsv() in text.ts.
import { describe, expect, it } from 'vitest';
import { parseCsv } from './text';

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
