// Tests for the Colombo time helpers in time.ts.
import { describe, expect, it } from 'vitest';
import { colomboDayOfWeek, colomboDaysUntil, colomboLocalToUtc, formatColombo, utcToColomboLocal } from './time';

describe('Colombo time', () => {
	it('converts Colombo wall-clock time to UTC', () => {
		expect(colomboLocalToUtc('2026-11-12T10:00')).toBe('2026-11-12T04:30:00.000Z');
	});

	it('handles a date without a time as midnight in Colombo (previous day in UTC)', () => {
		expect(colomboLocalToUtc('2026-12-01')).toBe('2026-11-30T18:30:00.000Z');
	});

	it('round-trips through utcToColomboLocal', () => {
		expect(utcToColomboLocal('2026-11-30T18:30:00.000Z')).toBe('2026-12-01T00:00');
		expect(utcToColomboLocal(colomboLocalToUtc('2027-01-31T23:59'))).toBe('2027-01-31T23:59');
	});

	it('rejects impossible dates', () => {
		expect(() => colomboLocalToUtc('2026-02-30')).toThrow();
		expect(() => colomboLocalToUtc('tomorrow')).toThrow();
	});

	it('gives the Colombo weekday, which can differ from UTC late at night', () => {
		// 2026-11-11 is a Wednesday. 20:00 UTC Wednesday is already 01:30 Thursday in Colombo.
		expect(colomboDayOfWeek(new Date('2026-11-11T10:00:00Z'))).toBe(3);
		expect(colomboDayOfWeek(new Date('2026-11-11T20:00:00Z'))).toBe(4);
		expect(colomboDayOfWeek(new Date('2026-11-15T10:00:00Z'))).toBe(7);
	});

	it('counts calendar days until a date in Colombo', () => {
		const now = new Date('2026-11-12T17:00:00Z'); // 22:30 Thursday in Colombo
		expect(colomboDaysUntil('2026-11-12T18:00:00Z', now)).toBe(0); // 23:30 the same day
		expect(colomboDaysUntil('2026-11-12T19:00:00Z', now)).toBe(1); // 00:30 Friday
		expect(colomboDaysUntil('2026-11-20T06:00:00Z', now)).toBe(8);
	});

	it('formats for display in Colombo time', () => {
		expect(formatColombo('2026-11-12T04:30:00.000Z')).toBe('12 Nov 2026, 10:00');
	});
});
