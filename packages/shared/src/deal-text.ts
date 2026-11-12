// Short human texts for a deal: the saving ("50% off · up to LKR 1,500"), the card value line
// ("40% off" + "up to Rs 5,000", or a crossed-out price) and valid days ("Tue and Thu").
// Used by the admin preview and the public deal cards and pages.
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

/** Rupees as shoppers write them: "Rs 5,000". */
export function formatRs(amount: number): string {
	return `Rs ${amount.toLocaleString('en-LK', { maximumFractionDigits: 2 })}`;
}

/**
 * The value line on a deal card: `main` in big type, `was` crossed out before it, `pill` as a small
 * discount badge, `note` in small grey after it. E.g. "40% off" + "up to Rs 5,000".
 */
export function cardValue(d: SavingFields & { originalPriceLkr: number | null }): {
	main: string;
	was?: string;
	pill?: string;
	note?: string;
} {
	const note =
		d.maxSavingLkr !== null
			? t('deal.up_to', { amount: formatRs(d.maxSavingLkr) })
			: d.minSpendLkr !== null
				? t('deal.min_spend', { amount: formatRs(d.minSpendLkr) })
				: undefined;
	if (d.dealPriceLkr !== null) {
		const off = d.originalPriceLkr ? Math.round((1 - d.dealPriceLkr / d.originalPriceLkr) * 100) : 0;
		return off > 0
			? { main: formatRs(d.dealPriceLkr), was: formatRs(d.originalPriceLkr!), pill: `-${off}%` }
			: { main: formatRs(d.dealPriceLkr) };
	}
	if (d.discountPercent !== null) {
		const key = d.dealType === 'cashback' ? 'deal.percent_cashback' : 'deal.percent_off';
		return { main: t(key, { percent: Math.round(d.discountPercent * 100) / 100 }), note };
	}
	if (d.discountAmountLkr !== null) {
		return { main: t('deal.amount_off', { amount: formatRs(d.discountAmountLkr) }), note };
	}
	return { main: t(`deal.type.${d.dealType as 'other'}`), note };
}

/** Compact LKR for tags: 750 -> "Rs 750", 1500 -> "Rs 1.5K", 25000 -> "Rs 25K". */
export function shortLkr(amount: number): string {
	if (amount < 1000) return `Rs ${Math.round(amount)}`;
	const k = amount / 1000;
	return `Rs ${k >= 10 || Number.isInteger(k) ? Math.round(k) : k.toFixed(1)}K`;
}

/** The two-line "Roo tag" on a deal card: a big value and a small word, e.g. "50%" / "OFF". */
export function savingTag(d: SavingFields): { big: string; small: string } {
	if (d.discountPercent !== null) return { big: `${Math.round(d.discountPercent)}%`, small: t('tag.off') };
	if (d.discountAmountLkr !== null) return { big: shortLkr(d.discountAmountLkr), small: t('tag.off') };
	if (d.dealPriceLkr !== null) return { big: shortLkr(d.dealPriceLkr), small: t('tag.now') };
	const words: Record<string, { big: string; small: string }> = {
		bogo: { big: '1+1', small: t('tag.free') },
		freebie: { big: t('tag.gift'), small: t('tag.free') },
		cashback: { big: t('tag.cash'), small: t('tag.back') }
	};
	return words[d.dealType] ?? { big: t('tag.deal'), small: t('tag.special') };
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
