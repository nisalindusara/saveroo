// Helpers for showing deals: valid today, days left, the card frame and badge, image sizes and a colour
// poster for deals without an image. Used by the public DealCard, DealGrid and deal page.
import type { PublicDealCard } from '@saveroo/shared';
import { colomboDaysUntil } from '@saveroo/shared/time';

/** True when the deal works on Colombo weekday `dow` (no valid-day rules means every day). */
export function validOn(card: Pick<PublicDealCard, 'validDays'>, dow: number): boolean {
	return card.validDays.length === 0 || card.validDays.includes(dow);
}

/** Days left (0 = ends today) when the deal ends within `withinDays`, otherwise null. */
export function endsWithin(card: Pick<PublicDealCard, 'endsAt'>, withinDays = 7, now = new Date()): number | null {
	if (!card.endsAt) return null;
	const days = colomboDaysUntil(card.endsAt, now);
	return days >= 0 && days <= withinDays ? days : null;
}

/** Shape used to reserve space for a card's poster before it loads (width / height). */
export function posterRatio(card: Pick<PublicDealCard, 'imageKey' | 'imageRatio'>): number {
	if (!card.imageKey) return 0.8; // colour poster
	// Images from before M5 have no recorded shape: show them in a square, fitted inside.
	return card.imageRatio ?? 1;
}

/** Card image frame (width / height), 16:10 as in the reference design. Every card uses it, so rows line up. */
export const CARD_FRAME = 1.6;

/**
 * True when a poster can fill the card frame (cropping a little); otherwise it is shown whole on a
 * blurred copy of itself, so text on posters is never cut off.
 */
export function fillsFrame(card: Pick<PublicDealCard, 'imageRatio'>): boolean {
	return card.imageRatio !== null && card.imageRatio >= 1.4 && card.imageRatio <= 1.85;
}

/** The one badge a card shows on its image: last days first, then "works today", then "popular". */
export function cardBadge(
	card: Pick<PublicDealCard, 'endsAt' | 'validDays' | 'isFeatured'>,
	today: number,
	now = new Date()
): { kind: 'ending'; days: number } | { kind: 'today' } | { kind: 'popular' } | null {
	const days = endsWithin(card, 3, now);
	if (days !== null) return { kind: 'ending', days };
	if (validOn(card, today)) return { kind: 'today' };
	return card.isFeatured ? { kind: 'popular' } : null;
}

/** `sizes` for card images in the grid: 1 column on phones, 2 from 640 px, 3 from 1024 px (max width 1280 px). */
export const CARD_SIZES = '(min-width: 1024px) 400px, (min-width: 640px) 48vw, 92vw';

// Warm, distinct backgrounds for deals without an image, picked from the merchant name.
const POSTER_COLOURS = [
	['#8c6244', '#fbf6f1'],
	['#0b7a53', '#eafaf2'],
	['#1f4bd8', '#eef2ff'],
	['#b8326b', '#fff0f6'],
	['#6d3fd1', '#f4efff'],
	['#8a5a00', '#fff8e6'],
	['#0e7490', '#ecfbff'],
	['#191c1f', '#f2f4f7']
] as const;

/** Background and text colour by position, so neighbouring tiles never repeat a colour. */
export function paletteAt(index: number): { bg: string; fg: string } {
	const [bg, fg] = POSTER_COLOURS[index % POSTER_COLOURS.length]!;
	return { bg, fg };
}

/** Background and text colour for a colour poster, stable per merchant. */
export function posterColours(seed: string): { bg: string; fg: string } {
	let hash = 0;
	for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
	const [bg, fg] = POSTER_COLOURS[hash % POSTER_COLOURS.length]!;
	return { bg, fg };
}
