// Tests for the Colombo time helpers in time.ts.
import { describe, expect, it } from 'vitest';
import { colomboLocalToUtc, formatColombo, utcToColomboLocal } from './time';

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

	it('formats for display in Colombo time', () => {
		expect(formatColombo('2026-11-12T04:30:00.000Z')).toBe('12 Nov 2026, 10:00');
	});
});
