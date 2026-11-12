// Helpers for showing deals: valid today, days left, masonry columns, image sizes and a colour poster
// for deals without an image. Used by the public DealCard, Masonry and deal page.
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

/**
 * Splits cards into `columns` columns, each card going to the currently shortest column, using the
 * known poster shapes. Adding cards later only appends to columns, so nothing on screen moves.
 */
export function distribute<T extends Pick<PublicDealCard, 'imageKey' | 'imageRatio'>>(
	cards: T[],
	columns: number,
	heights: number[] = new Array(columns).fill(0),
	into: T[][] = Array.from({ length: columns }, () => [])
): { columns: T[][]; heights: number[] } {
	// Card height relative to its width: the poster plus about 0.55 for the text below it.
	for (const card of cards) {
		const shortest = heights.indexOf(Math.min(...heights));
		into[shortest]!.push(card);
		heights[shortest]! += 1 / posterRatio(card) + 0.55;
	}
	return { columns: into, heights };
}

/** Number of masonry columns for a viewport width (matches the CSS breakpoints). */
export function columnsFor(width: number): number {
	if (width >= 1400) return 5;
	if (width >= 1100) return 4;
	if (width >= 720) return 3;
	return 2;
}

/** `sizes` for card images: roughly one column of the masonry at each breakpoint. */
export const CARD_SIZES = '(min-width: 1400px) 19vw, (min-width: 1100px) 23vw, (min-width: 720px) 31vw, 47vw';

// Warm, distinct backgrounds for deals without an image, picked from the merchant name.
const POSTER_COLOURS = [
	['#ff5a1f', '#fff4ec'],
	['#0f8a5f', '#eafaf2'],
	['#1f4bd8', '#eef2ff'],
	['#b8326b', '#fff0f6'],
	['#6d3fd1', '#f4efff'],
	['#c27c00', '#fff8e6'],
	['#0e7490', '#ecfbff'],
	['#1a1410', '#fbf7f1']
] as const;

/** Background and text colour for a colour poster, stable per merchant. */
export function posterColours(seed: string): { bg: string; fg: string } {
	let hash = 0;
	for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
	const [bg, fg] = POSTER_COLOURS[hash % POSTER_COLOURS.length]!;
	return { bg, fg };
}
