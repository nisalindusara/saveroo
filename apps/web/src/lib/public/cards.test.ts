// Tests for the deal card helpers in cards.ts.
import { describe, expect, it } from 'vitest';
import { cardBadge, endsWithin, fillsFrame, posterColours, posterRatio, validOn } from './cards';

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

describe('fillsFrame', () => {
	it('fills the 4:3 frame only with near-4:3 images', () => {
		expect(fillsFrame({ imageRatio: 1.33 })).toBe(true);
		expect(fillsFrame({ imageRatio: 0.8 })).toBe(false);
		expect(fillsFrame({ imageRatio: 1.78 })).toBe(false);
		expect(fillsFrame({ imageRatio: null })).toBe(false);
	});
});

describe('cardBadge', () => {
	const now = new Date('2026-11-12T06:00:00Z'); // Thursday (4) in Colombo
	const base = { endsAt: null, validDays: [] as number[], isFeatured: false };
	it('puts last days first, then works today, then popular', () => {
		expect(cardBadge({ ...base, endsAt: '2026-11-14T06:00:00Z' }, 4, now)).toEqual({ kind: 'ending', days: 2 });
		expect(cardBadge({ ...base, validDays: [4] }, 4, now)).toEqual({ kind: 'today' });
		expect(cardBadge({ ...base, validDays: [1], isFeatured: true }, 4, now)).toEqual({ kind: 'popular' });
		expect(cardBadge({ ...base, validDays: [1] }, 4, now)).toBeNull();
	});
});

describe('posterColours', () => {
	it('is stable for the same merchant', () => {
		expect(posterColours('Keells')).toEqual(posterColours('Keells'));
	});
});
