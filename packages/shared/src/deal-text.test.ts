// Tests for the deal texts in deal-text.ts.
import { describe, expect, it } from 'vitest';
import { daysText, savingTag, savingText } from './deal-text';

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

describe('savingTag', () => {
	it('shows the percentage, amount or deal price compactly', () => {
		expect(savingTag({ ...none, dealType: 'percent_off', discountPercent: 50 })).toEqual({ big: '50%', small: 'OFF' });
		expect(savingTag({ ...none, dealType: 'amount_off', discountAmountLkr: 750 })).toEqual({ big: 'Rs 750', small: 'OFF' });
		expect(savingTag({ ...none, dealType: 'amount_off', discountAmountLkr: 1500 })).toEqual({ big: 'Rs 1.5K', small: 'OFF' });
		expect(savingTag({ ...none, dealType: 'price_drop', dealPriceLkr: 25000 })).toEqual({ big: 'Rs 25K', small: 'NOW' });
	});

	it('uses words for deals without a number', () => {
		expect(savingTag({ ...none, dealType: 'bogo' })).toEqual({ big: '1+1', small: 'FREE' });
		expect(savingTag({ ...none, dealType: 'other' })).toEqual({ big: 'DEAL', small: 'SPECIAL' });
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
