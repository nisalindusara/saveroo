// Tests for the admin input rules in admin.ts (deal and merchant validation).
import { describe, expect, it } from 'vitest';
import { dealInputSchema, issuesToFields, merchantInputSchema } from './admin';

const merchantId = '6f1c1c4e-1111-4a2b-9c3d-000000000001';
const base = {
	merchantId,
	title: '50% off on Tuesdays',
	dealType: 'percent_off',
	discountPercent: 50,
	startsAt: '2026-11-12T04:30:00.000Z'
};

describe('dealInputSchema', () => {
	it('accepts a minimal % off deal and fills defaults', () => {
		const deal = dealInputSchema.parse(base);
		expect(deal.channel).toBe('in_store');
		expect(deal.eligibility).toEqual([]);
		expect(deal.description).toBeNull();
	});

	it('requires the percentage for a % off deal', () => {
		const result = dealInputSchema.safeParse({ ...base, discountPercent: null });
		expect(result.success).toBe(false);
		expect(issuesToFields(result.error!)).toHaveProperty('discountPercent');
	});

	it('requires the end to be after the start', () => {
		const result = dealInputSchema.safeParse({ ...base, endsAt: '2026-11-11T00:00:00.000Z' });
		expect(issuesToFields(result.error!)).toHaveProperty('endsAt');
	});

	it('requires a coupon for a coupon-code deal', () => {
		const result = dealInputSchema.safeParse({ ...base, dealType: 'coupon_code' });
		expect(issuesToFields(result.error!)).toHaveProperty('coupons');
	});

	it('sorts and de-duplicates schedule days and rejects day 8', () => {
		const ok = dealInputSchema.parse({ ...base, schedules: [{ daysOfWeek: [5, 2, 2] }] });
		expect(ok.schedules[0]!.daysOfWeek).toEqual([2, 5]);
		const bad = dealInputSchema.safeParse({ ...base, schedules: [{ daysOfWeek: [8] }] });
		expect(issuesToFields(bad.error!)).toHaveProperty(['schedules.0.daysOfWeek.0']);
	});

	it('rejects image keys that were not produced by an upload', () => {
		const result = dealInputSchema.safeParse({ ...base, imageKey: '../../etc/passwd' });
		expect(issuesToFields(result.error!)).toHaveProperty('imageKey');
	});
});

describe('merchantInputSchema', () => {
	it('lower-cases domains and needs both lat and lng', () => {
		const ok = merchantInputSchema.parse({ name: 'Daraz', domains: ['Daraz.LK'] });
		expect(ok.domains).toEqual(['daraz.lk']);
		const bad = merchantInputSchema.safeParse({ name: 'X', branches: [{ name: 'A', lat: 6.9 }] });
		expect(issuesToFields(bad.error!)).toHaveProperty(['branches.0.lat']);
	});

	it('rejects a branch location outside Sri Lanka', () => {
		const bad = merchantInputSchema.safeParse({ name: 'X', branches: [{ name: 'A', lat: 51.5, lng: -0.1 }] });
		expect(bad.success).toBe(false);
	});
});
