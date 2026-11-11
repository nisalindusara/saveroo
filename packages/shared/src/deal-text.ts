// Short human texts for a deal: the saving ("50% off · up to LKR 1,500") and valid days ("Tue and Thu").
// Used by the admin preview now and the public deal cards and pages from M5.
import { t } from './i18n';

export function formatLkr(amount: number): string {
	return `LKR ${amount.toLocaleString('en-LK', { maximumFractionDigits: 2 })}`;
}

type SavingFields = {
	dealType: string;
	discountPercent: number | null;
	discountAmountLkr: number | null;
	maxSavingLkr: number | null;
	minSpendLkr: number | null;
	dealPriceLkr: number | null;
};

/** One line describing the saving, with the cap and minimum spend when set. */
export function savingText(d: SavingFields): string {
	const parts: string[] = [];
	if (d.discountPercent !== null) parts.push(t('deal.percent_off', { percent: d.discountPercent }));
	else if (d.discountAmountLkr !== null) parts.push(t('deal.amount_off', { amount: formatLkr(d.discountAmountLkr) }));
	else if (d.dealPriceLkr !== null) parts.push(t('deal.now_price', { amount: formatLkr(d.dealPriceLkr) }));
	else parts.push(t(`deal.type.${d.dealType as 'other'}`));
	if (d.maxSavingLkr !== null) parts.push(t('deal.up_to', { amount: formatLkr(d.maxSavingLkr) }));
	if (d.minSpendLkr !== null) parts.push(t('deal.min_spend', { amount: formatLkr(d.minSpendLkr) }));
	return parts.join(' · ');
}

/** "Every day", "Weekends", "Weekdays" or a list like "Tue and Thu" (days are 1 = Mon to 7 = Sun). */
export function daysText(days: number[]): string {
	const sorted = [...new Set(days)].sort();
	if (sorted.length === 0 || sorted.length === 7) return t('deal.every_day');
	if (sorted.join() === '6,7') return t('deal.weekends');
	if (sorted.join() === '1,2,3,4,5') return t('deal.weekdays');
	const names = sorted.map((d) => t(`day.short.${d as 1}`));
	return names.length === 1 ? names[0]! : `${names.slice(0, -1).join(', ')} ${t('deal.and')} ${names.at(-1)}`;
}
