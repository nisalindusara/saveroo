// Public API shapes: deal cards and pages, merchant pages, categories, search, and their query rules.
// Built by the API's public endpoints (from the public_* database functions); used by web and mobile.
import { z } from 'zod';

const slug = z.string().trim().toLowerCase().max(120).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);

export const feedQuerySchema = z.object({
	category: slug.optional(),
	cursor: z.string().max(200).optional()
});
export const searchQuerySchema = z.object({
	q: z.string().trim().min(2, 'At least 2 characters').max(100),
	cursor: z.string().max(200).optional()
});
export const slugParamSchema = slug;

type DealBase = {
	id: string;
	slug: string;
	title: string;
	dealType: string;
	discountPercent: number | null;
	discountAmountLkr: number | null;
	maxSavingLkr: number | null;
	minSpendLkr: number | null;
	originalPriceLkr: number | null;
	dealPriceLkr: number | null;
	imageKey: string | null;
	/** Image width / height; null for images uploaded before M5 (no share JPEG either). */
	imageRatio: number | null;
	channel: 'in_store' | 'online' | 'both';
	startsAt: string;
	endsAt: string | null;
	isFeatured: boolean;
	/** 1 = Mon .. 7 = Sun; empty means every day. */
	validDays: number[];
	/** Banks and providers whose cards qualify; empty means open to everyone. */
	providers: { slug: string; name: string }[];
	hasCoupon: boolean;
};

export type PublicDealCard = DealBase & {
	merchant: { slug: string; name: string; logoKey: string | null };
};

export type PublicBranch = {
	name: string;
	address: string | null;
	city: string | null;
	district: string | null;
	phone?: string | null;
	lat: number | null;
	lng: number | null;
};

export type PublicDeal = DealBase & {
	merchant: { slug: string; name: string; logoKey: string | null; websiteUrl: string | null; isOnline: boolean };
	description: string | null;
	terms: string | null;
	howToRedeem: string | null;
	sourceUrl: string | null;
	verification: 'verified' | 'community' | 'unverified';
	lastCheckedAt: string | null;
	category: { slug: string; name: string } | null;
	schedules: {
		daysOfWeek: number[];
		startTime: string | null;
		endTime: string | null;
		validFrom: string | null;
		validTo: string | null;
		blackoutDates: string[];
		note: string | null;
	}[];
	eligibility: {
		provider: { slug: string; name: string; type: string; logoKey: string | null };
		card: { name: string; cardType: string; network: string } | null;
		cardType: string | null;
		note: string | null;
	}[];
	coupons: { code: string; kind: 'copy' | 'show_qr' | 'auto_apply' }[];
	/** True when the deal works at every branch of the merchant. */
	allBranches: boolean;
	branches: PublicBranch[];
};

export type PublicMerchant = {
	slug: string;
	name: string;
	description: string | null;
	logoKey: string | null;
	coverKey: string | null;
	websiteUrl: string | null;
	isOnline: boolean;
	hasPhysicalStores: boolean;
	isVerified: boolean;
	category: { slug: string; name: string } | null;
	branches: PublicBranch[];
};

export type PublicCategory = {
	slug: string;
	name: string;
	icon: string | null;
	children: { slug: string; name: string; icon: string | null }[];
};

export type PublicMerchantMatch = { slug: string; name: string; logoKey: string | null; liveDeals: number };

export type PublicHome = {
	/** Valid today (Colombo weekday), featured first. */
	today: PublicDealCard[];
	/** Ending within 7 days, soonest first. */
	ending: PublicDealCard[];
	counts: { live: number; today: number; merchants: number };
	/** First page of the newest deals. */
	latest: PublicDealCard[];
	latestCursor: string | null;
};

export type PublicSitemap = {
	deals: { slug: string; updatedAt: string }[];
	merchants: { slug: string; updatedAt: string }[];
	categories: { slug: string; updatedAt: string }[];
};

/** A page of results: `nextCursor` is null on the last page. */
export type Page<T> = { data: T[]; nextCursor: string | null; error: null };
