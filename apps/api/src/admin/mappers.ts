// Converts between admin API shapes (camelCase, validated by @saveroo/shared) and database rows
// (snake_case) for merchants and deals. Used by the admin routes and the CSV import.
import type { AdminDeal, AdminMerchant, DealData, MerchantData } from '@saveroo/shared';

type Row = Record<string, unknown>;
const str = (v: unknown) => (v === null || v === undefined ? null : String(v));
const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const hhmm = (v: unknown) => (typeof v === 'string' ? v.slice(0, 5) : null);
const iso = (v: unknown) => (typeof v === 'string' ? new Date(v).toISOString() : null);

/** Arguments for the admin_save_merchant database function. */
export function merchantToRpc(actorId: string, m: MerchantData) {
	return {
		p_actor: actorId,
		p_merchant: {
			id: m.id,
			slug: m.slug,
			name: m.name,
			description: m.description,
			logo_url: m.logoKey,
			cover_url: m.coverKey,
			website_url: m.websiteUrl,
			domains: m.domains,
			phone: m.phone,
			primary_category_id: m.primaryCategoryId,
			is_online: m.isOnline,
			has_physical_stores: m.hasPhysicalStores,
			is_verified: m.isVerified,
			status: m.status
		},
		p_branches: m.branches.map((b) => ({
			id: b.id,
			name: b.name,
			address: b.address,
			city: b.city,
			district: b.district,
			lat: b.lat,
			lng: b.lng,
			phone: b.phone,
			status: b.status
		}))
	};
}

/** The deal row and its details in the shape admin_save_deal and admin_import_deals expect. */
export function dealToRpcParts(d: DealData) {
	return {
		deal: {
			id: d.id,
			merchant_id: d.merchantId,
			slug: d.slug,
			title: d.title,
			description: d.description,
			category_id: d.categoryId,
			brand_id: d.brandId,
			deal_type: d.dealType,
			discount_percent: d.discountPercent,
			discount_amount_lkr: d.discountAmountLkr,
			max_saving_lkr: d.maxSavingLkr,
			min_spend_lkr: d.minSpendLkr,
			original_price_lkr: d.originalPriceLkr,
			deal_price_lkr: d.dealPriceLkr,
			terms: d.terms,
			how_to_redeem: d.howToRedeem,
			channel: d.channel,
			source_url: d.sourceUrl,
			proof_image_url: d.proofImageKey,
			image_url: d.imageKey,
			image_ratio: d.imageRatio,
			affiliate_url: d.affiliateUrl,
			verification: d.verification,
			starts_at: d.startsAt,
			ends_at: d.endsAt,
			is_featured: d.isFeatured,
			featured_until: d.featuredUntil
		},
		branch_ids: d.branchIds,
		eligibility: d.eligibility.map((e) => ({
			provider_id: e.providerId,
			card_product_id: e.cardProductId,
			card_type: e.cardType,
			note: e.note
		})),
		schedules: d.schedules.map((s) => ({
			days_of_week: s.daysOfWeek,
			start_time: s.startTime,
			end_time: s.endTime,
			valid_from: s.validFrom,
			valid_to: s.validTo,
			blackout_dates: s.blackoutDates,
			note: s.note
		})),
		coupons: d.coupons.map((c) => ({
			code: c.code,
			kind: c.kind,
			usage_limit: c.usageLimit,
			valid_from: c.validFrom,
			valid_to: c.validTo
		}))
	};
}

/** Arguments for the admin_save_deal database function. */
export function dealToRpc(actorId: string, d: DealData) {
	const parts = dealToRpcParts(d);
	return {
		p_actor: actorId,
		p_deal: parts.deal,
		p_branch_ids: parts.branch_ids,
		p_eligibility: parts.eligibility,
		p_schedules: parts.schedules,
		p_coupons: parts.coupons
	};
}

/** merchant_snapshot() output to the admin API shape. */
export function snapshotToMerchant(s: Row): AdminMerchant {
	const branches = (s.branches as Row[]) ?? [];
	return {
		id: String(s.id),
		slug: String(s.slug),
		name: String(s.name),
		description: str(s.description),
		logoKey: str(s.logo_url),
		coverKey: str(s.cover_url),
		websiteUrl: str(s.website_url),
		domains: (s.domains as string[]) ?? [],
		phone: str(s.phone),
		primaryCategoryId: str(s.primary_category_id),
		isOnline: Boolean(s.is_online),
		hasPhysicalStores: Boolean(s.has_physical_stores),
		isVerified: Boolean(s.is_verified),
		status: s.status as AdminMerchant['status'],
		updatedAt: String(iso(s.updated_at)),
		branches: branches.map((b) => ({
			id: String(b.id),
			name: String(b.name),
			address: str(b.address),
			city: str(b.city),
			district: str(b.district),
			lat: num(b.lat),
			lng: num(b.lng),
			phone: str(b.phone),
			status: b.status as AdminMerchant['status']
		}))
	};
}

/** deal_snapshot() output (plus the merchant name) to the admin API shape. */
export function snapshotToDeal(s: Row, merchantName: string): AdminDeal {
	return {
		id: String(s.id),
		slug: String(s.slug),
		status: s.status as AdminDeal['status'],
		merchantId: String(s.merchant_id),
		merchantName,
		title: String(s.title),
		description: str(s.description),
		categoryId: str(s.category_id),
		brandId: str(s.brand_id),
		dealType: s.deal_type as AdminDeal['dealType'],
		discountPercent: num(s.discount_percent),
		discountAmountLkr: num(s.discount_amount_lkr),
		maxSavingLkr: num(s.max_saving_lkr),
		minSpendLkr: num(s.min_spend_lkr),
		originalPriceLkr: num(s.original_price_lkr),
		dealPriceLkr: num(s.deal_price_lkr),
		terms: str(s.terms),
		howToRedeem: str(s.how_to_redeem),
		channel: s.channel as AdminDeal['channel'],
		sourceUrl: str(s.source_url),
		proofImageKey: str(s.proof_image_url),
		imageKey: str(s.image_url),
		imageRatio: num(s.image_ratio),
		affiliateUrl: str(s.affiliate_url),
		verification: s.verification as AdminDeal['verification'],
		startsAt: String(iso(s.starts_at)),
		endsAt: iso(s.ends_at),
		isFeatured: Boolean(s.is_featured),
		featuredUntil: iso(s.featured_until),
		lastCheckedAt: iso(s.last_checked_at),
		recheckDueAt: iso(s.recheck_due_at),
		createdAt: String(iso(s.created_at)),
		updatedAt: String(iso(s.updated_at)),
		branchIds: (s.branch_ids as string[]) ?? [],
		eligibility: ((s.eligibility as Row[]) ?? []).map((e) => ({
			providerId: String(e.provider_id),
			cardProductId: str(e.card_product_id),
			cardType: (e.card_type ?? null) as AdminDeal['eligibility'][number]['cardType'],
			note: str(e.note)
		})),
		schedules: ((s.schedules as Row[]) ?? []).map((sc) => ({
			daysOfWeek: (sc.days_of_week as number[]) ?? [],
			startTime: hhmm(sc.start_time),
			endTime: hhmm(sc.end_time),
			validFrom: str(sc.valid_from),
			validTo: str(sc.valid_to),
			blackoutDates: (sc.blackout_dates as string[]) ?? [],
			note: str(sc.note)
		})),
		coupons: ((s.coupons as Row[]) ?? []).map((c) => ({
			code: String(c.code),
			kind: c.kind as AdminDeal['coupons'][number]['kind'],
			usageLimit: num(c.usage_limit),
			validFrom: iso(c.valid_from),
			validTo: iso(c.valid_to)
		}))
	};
}
