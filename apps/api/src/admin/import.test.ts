// Tests for turning CSV rows into deals (rowToDeal) in the admin CSV import.
import { describe, expect, it } from 'vitest';
import { dealInputSchema } from '@saveroo/shared';
import { rowToDeal } from './import';

const MERCHANT = '6f1c1c4e-1111-4a2b-9c3d-000000000001';
const HNB = '6f1c1c4e-1111-4a2b-9c3d-000000000002';
const SAMPATH = '6f1c1c4e-1111-4a2b-9c3d-000000000003';
const lookups = {
	merchants: new Map([['scope-cinemas', MERCHANT]]),
	categories: new Map([['entertainment', '6f1c1c4e-1111-4a2b-9c3d-000000000004']]),
	providers: new Map([
		['hnb', HNB],
		['sampath-bank', SAMPATH]
	])
};
const NOW = '2026-11-11T00:00:00.000Z';

describe('rowToDeal', () => {
	it('reads a full row: Tuesday and Thursday, two banks, coupon, Sri Lanka dates', () => {
		const deal = dealInputSchema.parse(
			rowToDeal(
				{
					merchant_slug: 'Scope-Cinemas',
					title: '50% off tickets',
					deal_type: 'percent_off',
					discount_percent: '50',
					max_saving_lkr: '1,500',
					category_slug: 'entertainment',
					starts: '2026-11-12',
					ends: '2026-12-31',
					days: 'tue|thu',
					providers: 'hnb|sampath-bank',
					card_type: 'credit',
					coupon_code: 'MOVIE50'
				},
				lookups,
				NOW
			)
		);
		expect(deal.merchantId).toBe(MERCHANT);
		expect(deal.maxSavingLkr).toBe(1500);
		expect(deal.startsAt).toBe('2026-11-11T18:30:00.000Z');
		expect(deal.endsAt).toBe('2026-12-31T18:29:00.000Z');
		expect(deal.schedules).toEqual([expect.objectContaining({ daysOfWeek: [2, 4] })]);
		expect(deal.eligibility.map((e) => e.providerId)).toEqual([HNB, SAMPATH]);
		expect(deal.eligibility[0]!.cardType).toBe('credit');
		expect(deal.coupons[0]!.code).toBe('MOVIE50');
	});

	it('starts now when no start is given and accepts day numbers', () => {
		const deal = rowToDeal(
			{ merchant_slug: 'scope-cinemas', title: 'Weekend offer', deal_type: 'other', days: '6|7' },
			lookups,
			NOW
		);
		expect(deal.startsAt).toBe(NOW);
		expect(deal.schedules).toEqual([{ daysOfWeek: [6, 7] }]);
	});

	it('names the problem for unknown merchants, providers, days and bad numbers', () => {
		const row = { merchant_slug: 'scope-cinemas', title: 'X deal', deal_type: 'other' };
		expect(() => rowToDeal({ ...row, merchant_slug: 'nope' }, lookups, NOW)).toThrow(/merchant_slug: no merchant "nope"/);
		expect(() => rowToDeal({ ...row, providers: 'hnb|xyz' }, lookups, NOW)).toThrow(/providers: no provider "xyz"/);
		expect(() => rowToDeal({ ...row, days: 'funday' }, lookups, NOW)).toThrow(/days: "funday"/);
		expect(() => rowToDeal({ ...row, discount_percent: 'half' }, lookups, NOW)).toThrow(/discount_percent/);
		expect(() => rowToDeal({ ...row, starts: '12/11/2026' }, lookups, NOW)).toThrow(/starts: use YYYY-MM-DD/);
	});
});
