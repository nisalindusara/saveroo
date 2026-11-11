// Input rules and reply types for the admin tool: merchants, branches, deals and their details.
// The API validates every admin request with these; the admin pages use the types.
import { z } from 'zod';

const slug = z
	.string()
	.trim()
	.max(120)
	.regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens');
/** Optional text: empty becomes null. */
const text = (max: number) =>
	z
		.string()
		.trim()
		.max(max)
		.nullish()
		.transform((v) => (v ? v : null));
const url = z
	.url({ protocol: /^https?$/ })
	.max(2000)
	.nullish()
	.transform((v) => v ?? null);
const lkr = z
	.number()
	.nonnegative()
	.max(9_999_999_999)
	.nullish()
	.transform((v) => v ?? null);
const id = z.uuid();
const optionalId = id.nullish().transform((v) => v ?? null);
const isoDateTime = z.iso.datetime({ offset: true });
const isoDate = z.iso.date();
const hhmm = z
	.string()
	.regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM')
	.nullish()
	.transform((v) => v ?? null);
/** Image key in the media bucket, e.g. "deals/2f1c.../a1b2c3d4". */
export const imageKeySchema = z
	.string()
	.regex(/^(deals|merchants)\/[a-z0-9-]{1,64}\/[a-z0-9]{8,32}$/, 'Not an uploaded image')
	.nullish()
	.transform((v) => v ?? null);

export const merchantStatusSchema = z.enum(['active', 'hidden']);
export const dealTypeSchema = z.enum([
	'percent_off',
	'amount_off',
	'bogo',
	'freebie',
	'cashback',
	'coupon_code',
	'price_drop',
	'bundle',
	'other'
]);
export const dealChannelSchema = z.enum(['in_store', 'online', 'both']);
export const dealStatusSchema = z.enum(['draft', 'pending', 'live', 'paused', 'expired', 'rejected']);
export const dealVerificationSchema = z.enum(['verified', 'community', 'unverified']);
export const cardTypeSchema = z.enum(['credit', 'debit', 'prepaid', 'loyalty', 'other']);
export const couponKindSchema = z.enum(['copy', 'show_qr', 'auto_apply']);

export const branchInputSchema = z
	.object({
		id: optionalId,
		name: z.string().trim().min(1, 'Required').max(120),
		address: text(300),
		city: text(80),
		district: text(80),
		lat: z.number().min(5.5).max(10).nullish().transform((v) => v ?? null),
		lng: z.number().min(79).max(82.5).nullish().transform((v) => v ?? null),
		phone: text(40),
		status: merchantStatusSchema.default('active')
	})
	.refine((b) => (b.lat === null) === (b.lng === null), {
		message: 'Give both latitude and longitude, or neither',
		path: ['lat']
	});

export const merchantInputSchema = z.object({
	id: optionalId,
	slug: slug.nullish().transform((v) => v ?? null),
	name: z.string().trim().min(1, 'Required').max(120),
	description: text(2000),
	logoKey: imageKeySchema,
	coverKey: imageKeySchema,
	websiteUrl: url,
	domains: z
		.array(
			z
				.string()
				.trim()
				.toLowerCase()
				.regex(/^([a-z0-9-]+\.)+[a-z]{2,}$/, 'Domain like daraz.lk')
		)
		.max(20)
		.default([]),
	phone: text(40),
	primaryCategoryId: optionalId,
	isOnline: z.boolean().default(false),
	hasPhysicalStores: z.boolean().default(true),
	isVerified: z.boolean().default(false),
	status: merchantStatusSchema.default('active'),
	branches: z.array(branchInputSchema).max(300).default([])
});
export type MerchantInput = z.input<typeof merchantInputSchema>;
export type MerchantData = z.output<typeof merchantInputSchema>;

export const eligibilityInputSchema = z.object({
	providerId: id,
	cardProductId: optionalId,
	cardType: cardTypeSchema.nullish().transform((v) => v ?? null),
	note: text(200)
});

export const scheduleInputSchema = z
	.object({
		daysOfWeek: z
			.array(z.number().int().min(1).max(7))
			.min(1, 'Pick at least one day')
			.max(7)
			.transform((days) => [...new Set(days)].sort()),
		startTime: hhmm,
		endTime: hhmm,
		validFrom: isoDate.nullish().transform((v) => v ?? null),
		validTo: isoDate.nullish().transform((v) => v ?? null),
		blackoutDates: z.array(isoDate).max(100).default([]),
		note: text(200)
	})
	.refine((s) => !s.validFrom || !s.validTo || s.validTo >= s.validFrom, {
		message: 'Must be on or after "valid from"',
		path: ['validTo']
	});

export const couponInputSchema = z.object({
	code: z.string().trim().min(1, 'Required').max(64),
	kind: couponKindSchema.default('copy'),
	usageLimit: z.number().int().positive().nullish().transform((v) => v ?? null),
	validFrom: isoDateTime.nullish().transform((v) => v ?? null),
	validTo: isoDateTime.nullish().transform((v) => v ?? null)
});

export const dealInputSchema = z
	.object({
		id: optionalId,
		merchantId: id,
		slug: slug.nullish().transform((v) => v ?? null),
		title: z.string().trim().min(3, 'At least 3 characters').max(140),
		description: text(4000),
		categoryId: optionalId,
		brandId: optionalId,
		dealType: dealTypeSchema,
		discountPercent: z
			.number()
			.gt(0)
			.max(100)
			.nullish()
			.transform((v) => v ?? null),
		discountAmountLkr: lkr,
		maxSavingLkr: lkr,
		minSpendLkr: lkr,
		originalPriceLkr: lkr,
		dealPriceLkr: lkr,
		terms: text(4000),
		howToRedeem: text(2000),
		channel: dealChannelSchema.default('in_store'),
		sourceUrl: url,
		proofImageKey: imageKeySchema,
		imageKey: imageKeySchema,
		affiliateUrl: url,
		verification: dealVerificationSchema.default('unverified'),
		startsAt: isoDateTime,
		endsAt: isoDateTime.nullish().transform((v) => v ?? null),
		isFeatured: z.boolean().default(false),
		featuredUntil: isoDateTime.nullish().transform((v) => v ?? null),
		branchIds: z.array(id).max(300).default([]),
		eligibility: z.array(eligibilityInputSchema).max(50).default([]),
		schedules: z.array(scheduleInputSchema).max(10).default([]),
		coupons: z.array(couponInputSchema).max(50).default([])
	})
	.superRefine((d, ctx) => {
		if (d.endsAt && d.endsAt <= d.startsAt) {
			ctx.addIssue({ code: 'custom', message: 'Must be after the start', path: ['endsAt'] });
		}
		if (d.dealType === 'percent_off' && d.discountPercent === null) {
			ctx.addIssue({ code: 'custom', message: 'Required for a % off deal', path: ['discountPercent'] });
		}
		if (d.dealType === 'amount_off' && d.discountAmountLkr === null) {
			ctx.addIssue({ code: 'custom', message: 'Required for an amount off deal', path: ['discountAmountLkr'] });
		}
		if (d.dealType === 'coupon_code' && d.coupons.length === 0) {
			ctx.addIssue({ code: 'custom', message: 'Add at least one coupon code', path: ['coupons'] });
		}
	});
export type DealInput = z.input<typeof dealInputSchema>;
export type DealData = z.output<typeof dealInputSchema>;

export const dealStatusChangeSchema = z.object({
	status: z.enum(['live', 'paused', 'expired', 'draft', 'rejected'])
});
export const markCheckedSchema = z.object({
	recheckDays: z.number().int().min(1).max(90).default(14)
});

/** Turns zod issues into `{ "field.path": "message" }` for form errors. */
export function issuesToFields(error: z.ZodError): Record<string, string> {
	const fields: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = issue.path.join('.') || '_';
		fields[key] ??= issue.message;
	}
	return fields;
}

// ---- Reply types (built by the API from database rows) ----

export type AdminReference = {
	categories: { id: string; slug: string; name: string; parentId: string | null }[];
	brands: { id: string; slug: string; name: string }[];
	providers: { id: string; slug: string; name: string; type: string }[];
	cardProducts: { id: string; providerId: string; name: string; cardType: string; network: string }[];
};

export type AdminBranch = z.output<typeof branchInputSchema> & { id: string };
export type AdminMerchant = Omit<MerchantData, 'branches' | 'id' | 'slug'> & {
	id: string;
	slug: string;
	branches: AdminBranch[];
	updatedAt: string;
};
export type AdminMerchantListItem = {
	id: string;
	slug: string;
	name: string;
	status: string;
	branchCount: number;
	liveDealCount: number;
};

export type AdminDeal = Omit<DealData, 'id' | 'slug'> & {
	id: string;
	slug: string;
	status: z.infer<typeof dealStatusSchema>;
	merchantName: string;
	lastCheckedAt: string | null;
	recheckDueAt: string | null;
	createdAt: string;
	updatedAt: string;
};
export type AdminDealListItem = {
	id: string;
	slug: string;
	title: string;
	status: z.infer<typeof dealStatusSchema>;
	merchantName: string;
	startsAt: string;
	endsAt: string | null;
	recheckDueAt: string | null;
	updatedAt: string;
};
export type DuplicateDeal = { id: string; slug: string; title: string; status: string; similarity: number };

export type AdminDashboard = {
	counts: { live: number; drafts: number; expiringSoon: number; needsRecheck: number };
	expiringSoon: AdminDealListItem[];
	needsRecheck: AdminDealListItem[];
	drafts: AdminDealListItem[];
};

export type AuditEntry = {
	id: string;
	actorEmail: string | null;
	action: string;
	entityType: string;
	entityId: string | null;
	diff: unknown;
	createdAt: string;
};

export type CsvImportResult =
	| { imported: number; dealIds: string[] }
	| { imported: 0; errors: { row: number; message: string }[] };
