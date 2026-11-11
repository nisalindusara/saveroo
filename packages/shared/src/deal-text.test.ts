// Tests for the deal texts in deal-text.ts.
import { describe, expect, it } from 'vitest';
import { daysText, savingText } from './deal-text';

const none = { discountPercent: null, discountAmountLkr: null, maxSavingLkr: null, minSpendLkr: null, dealPriceLkr: null };

describe('savingText', () => {
	it('shows percent with cap and minimum spend', () => {
		expect(savingText({ ...none, dealType: 'percent_off', discountPercent: 50, maxSavingLkr: 1500, minSpendLkr: 5000 })).toBe(
			'50% off · up to LKR 1,500 · min. spend LKR 5,000'
		);
	});

	it('shows an amount off or the deal type when there is no number', () => {
		expect(savingText({ ...none, dealType: 'amount_off', discountAmountLkr: 750 })).toBe('LKR 750 off');
		expect(savingText({ ...none, dealType: 'bogo' })).toBe('Buy one, get one free');
	});
});

describe('daysText', () => {
	it('names common patterns', () => {
		expect(daysText([])).toBe('Every day');
		expect(daysText([6, 7])).toBe('Weekends');
		expect(daysText([5, 4, 3, 2, 1])).toBe('Weekdays');
	});

	it('lists other days in order', () => {
		expect(daysText([2])).toBe('Tue');
		expect(daysText([4, 2])).toBe('Tue and Thu');
		expect(daysText([1, 3, 5])).toBe('Mon, Wed and Fri');
	});
});
