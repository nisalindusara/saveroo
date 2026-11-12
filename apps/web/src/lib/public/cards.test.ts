// Tests for the deal card helpers in cards.ts.
import { describe, expect, it } from 'vitest';
import { columnsFor, distribute, endsWithin, posterColours, posterRatio, validOn } from './cards';

const card = (imageRatio: number | null, imageKey: string | null = 'deals/2026-11/abcdef12') => ({ imageKey, imageRatio });

describe('validOn', () => {
	it('treats no rules as every day', () => {
		expect(validOn({ validDays: [] }, 3)).toBe(true);
		expect(validOn({ validDays: [2] }, 2)).toBe(true);
		expect(validOn({ validDays: [2] }, 3)).toBe(false);
	});
});

describe('endsWithin', () => {
	const now = new Date('2026-11-12T06:00:00Z');
	it('counts Colombo days left, only within the window', () => {
		expect(endsWithin({ endsAt: '2026-11-12T17:00:00Z' }, 7, now)).toBe(0);
		expect(endsWithin({ endsAt: '2026-11-15T06:00:00Z' }, 7, now)).toBe(3);
		expect(endsWithin({ endsAt: '2026-12-15T06:00:00Z' }, 7, now)).toBeNull();
		expect(endsWithin({ endsAt: null }, 7, now)).toBeNull();
	});
});

describe('posterRatio', () => {
	it('uses the stored shape, a square for old images and 4:5 for colour posters', () => {
		expect(posterRatio(card(0.75))).toBe(0.75);
		expect(posterRatio(card(null))).toBe(1);
		expect(posterRatio(card(null, null))).toBe(0.8);
	});
});

describe('distribute', () => {
	it('puts each card in the shortest column', () => {
		const tall = card(0.5); // height 2 + 0.55
		const wide = card(2); // height 0.5 + 0.55
		const { columns } = distribute([tall, wide, wide, wide], 2);
		expect(columns[0]).toEqual([tall]);
		expect(columns[1]).toEqual([wide, wide, wide]);
	});

	it('appends later cards without moving earlier ones', () => {
		const first = distribute([card(1), card(1)], 2);
		const before = first.columns.map((c) => [...c]);
		const next = distribute([card(1)], 2, first.heights, first.columns);
		expect(next.columns[0]!.slice(0, before[0]!.length)).toEqual(before[0]);
		expect(next.columns[1]!.slice(0, before[1]!.length)).toEqual(before[1]);
	});
});

describe('columnsFor', () => {
	it('uses 2 columns on phones and more on wider screens', () => {
		expect(columnsFor(360)).toBe(2);
		expect(columnsFor(800)).toBe(3);
		expect(columnsFor(1200)).toBe(4);
		expect(columnsFor(1600)).toBe(5);
	});
});

describe('posterColours', () => {
	it('is stable for the same merchant', () => {
		expect(posterColours('Keells')).toEqual(posterColours('Keells'));
	});
});
