// Tests for the health response schema in health.ts.
import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './health';

describe('healthResponseSchema', () => {
	it('accepts a valid health response', () => {
		const body = {
			data: { status: 'ok', database: 'ok', time: '2026-11-10T08:00:00.000Z' },
			error: null
		};
		expect(healthResponseSchema.safeParse(body).success).toBe(true);
	});

	it('rejects an unknown database state', () => {
		const body = {
			data: { status: 'ok', database: 'maybe', time: '2026-11-10T08:00:00.000Z' },
			error: null
		};
		expect(healthResponseSchema.safeParse(body).success).toBe(false);
	});
});
