// POST /admin/import/deals: bulk-creates draft deals from CSV text. Every row is checked first;
// if any row has a problem nothing is saved and the reply lists each problem by spreadsheet row.
import { Hono } from 'hono';
import { z } from 'zod';
import {
	colomboLocalToUtc,
	dealInputSchema,
	issuesToFields,
	parseCsv,
	type ApiResponse,
	type CsvImportResult,
	type DealInput
} from '@saveroo/shared';
import type { AuthEnv } from '../auth';
import { dbErrorResponse, errorResponse } from '../errors';
import { readJson } from '../validate';
import { dealToRpcParts } from './mappers';

export const CSV_COLUMNS = [
	'merchant_slug',
	'title',
	'deal_type',
	'discount_percent',
	'discount_amount_lkr',
	'max_saving_lkr',
	'min_spend_lkr',
	'original_price_lkr',
	'deal_price_lkr',
	'channel',
	'category_slug',
	'starts',
	'ends',
	'days',
	'providers',
	'card_type',
	'coupon_code',
	'terms',
	'how_to_redeem',
	'description',
	'source_url'
] as const;
const REQUIRED = ['merchant_slug', 'title', 'deal_type'] as const;
const MAX_ROWS = 500;
const DAY_NUMBERS: Record<string, number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6, sun: 7 };

type Lookups = {
	merchants: Map<string, string>;
	categories: Map<string, string>;
	providers: Map<string, string>;
};

class RowError extends Error {}

const list = (v: string) => v.split('|').map((s) => s.trim()).filter(Boolean);

function number(value: string, column: string) {
	if (!value) return null;
	const n = Number(value.replace(/,/g, ''));
	if (!Number.isFinite(n)) throw new RowError(`${column}: "${value}" is not a number`);
	return n;
}

function colomboTime(value: string, column: string, endOfDay: boolean) {
	const v = /^\d{4}-\d{2}-\d{2}$/.test(value) && endOfDay ? `${value} 23:59` : value;
	try {
		return colomboLocalToUtc(v);
	} catch {
		throw new RowError(`${column}: use YYYY-MM-DD or YYYY-MM-DD HH:MM (Sri Lanka time)`);
	}
}

/** One CSV row (column name to cell) to a deal for validation. Throws RowError for lookup problems. */
export function rowToDeal(cells: Record<string, string>, lookups: Lookups, now: string): DealInput {
	const merchantId = lookups.merchants.get(cells.merchant_slug!.toLowerCase());
	if (!merchantId) throw new RowError(`merchant_slug: no merchant "${cells.merchant_slug}"`);

	let categoryId: string | null = null;
	if (cells.category_slug) {
		categoryId = lookups.categories.get(cells.category_slug.toLowerCase()) ?? null;
		if (!categoryId) throw new RowError(`category_slug: no category "${cells.category_slug}"`);
	}

	const days = list(cells.days ?? '').map((d) => {
		const day = DAY_NUMBERS[d.slice(0, 3).toLowerCase()] ?? Number(d);
		if (!Number.isInteger(day) || day < 1 || day > 7) throw new RowError(`days: "${d}" is not a day (mon-sun or 1-7)`);
		return day;
	});

	const eligibility = list(cells.providers ?? '').map((slug) => {
		const providerId = lookups.providers.get(slug.toLowerCase());
		if (!providerId) throw new RowError(`providers: no provider "${slug}"`);
		return { providerId, cardType: (cells.card_type || null) as never };
	});

	return {
		merchantId,
		title: cells.title!,
		dealType: cells.deal_type!.toLowerCase() as DealInput['dealType'],
		discountPercent: number(cells.discount_percent ?? '', 'discount_percent'),
		discountAmountLkr: number(cells.discount_amount_lkr ?? '', 'discount_amount_lkr'),
		maxSavingLkr: number(cells.max_saving_lkr ?? '', 'max_saving_lkr'),
		minSpendLkr: number(cells.min_spend_lkr ?? '', 'min_spend_lkr'),
		originalPriceLkr: number(cells.original_price_lkr ?? '', 'original_price_lkr'),
		dealPriceLkr: number(cells.deal_price_lkr ?? '', 'deal_price_lkr'),
		channel: (cells.channel || undefined) as DealInput['channel'],
		categoryId,
		startsAt: cells.starts ? colomboTime(cells.starts, 'starts', false) : now,
		endsAt: cells.ends ? colomboTime(cells.ends, 'ends', true) : null,
		schedules: days.length ? [{ daysOfWeek: days }] : [],
		eligibility,
		coupons: cells.coupon_code ? [{ code: cells.coupon_code }] : [],
		terms: cells.terms,
		howToRedeem: cells.how_to_redeem,
		description: cells.description,
		sourceUrl: cells.source_url || null
	};
}

export const csvImport = new Hono<AuthEnv>().post('/deals', async (c) => {
	const input = await readJson(c, z.object({ csv: z.string().min(1).max(1_000_000) }));
	if (!input.ok) return input.response;

	const rows = parseCsv(input.data.csv);
	const header = (rows.shift() ?? []).map((h) => h.trim().toLowerCase());
	const errors: { row: number; message: string }[] = [];
	const unknown = header.filter((h) => !(CSV_COLUMNS as readonly string[]).includes(h));
	if (unknown.length) errors.push({ row: 1, message: `Unknown columns: ${unknown.join(', ')}` });
	const missing = REQUIRED.filter((h) => !header.includes(h));
	if (missing.length) errors.push({ row: 1, message: `Missing columns: ${missing.join(', ')}` });
	if (rows.length === 0) errors.push({ row: 2, message: 'No deals in the file.' });
	if (rows.length > MAX_ROWS) errors.push({ row: MAX_ROWS + 2, message: `At most ${MAX_ROWS} deals per file.` });
	if (errors.length) return importFailed(c, errors);

	const records = rows.map((cells) => Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()])));
	const db = c.get('db');
	const merchantSlugs = [...new Set(records.map((r) => r.merchant_slug!.toLowerCase()).filter(Boolean))];
	const [merchantRows, categoryRows, providerRows] = await Promise.all([
		db.from('merchants').select('id, slug').in('slug', merchantSlugs),
		db.from('categories').select('id, slug'),
		db.from('providers').select('id, slug')
	]);
	const failed = [merchantRows, categoryRows, providerRows].find((r) => r.error);
	if (failed?.error) return dbErrorResponse(c, failed.error);
	const toMap = (rs: { id: string; slug: string }[] | null) => new Map((rs ?? []).map((r) => [r.slug, r.id]));
	const lookups = {
		merchants: toMap(merchantRows.data),
		categories: toMap(categoryRows.data),
		providers: toMap(providerRows.data)
	};

	const now = new Date().toISOString();
	const items: ReturnType<typeof dealToRpcParts>[] = [];
	records.forEach((record, i) => {
		const row = i + 2;
		const empty = REQUIRED.find((h) => !record[h]);
		if (empty) return errors.push({ row, message: `${empty}: required` });
		try {
			const parsed = dealInputSchema.safeParse(rowToDeal(record, lookups, now));
			if (!parsed.success) {
				const fields = issuesToFields(parsed.error);
				return errors.push({ row, message: Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('; ') });
			}
			items.push(dealToRpcParts(parsed.data));
		} catch (e) {
			if (e instanceof RowError) return errors.push({ row, message: e.message });
			throw e;
		}
	});
	if (errors.length) return importFailed(c, errors);

	const { data: ids, error } = await db.rpc('admin_import_deals', { p_actor: c.get('user').id, p_items: items });
	if (error) return dbErrorResponse(c, error);
	const body: ApiResponse<CsvImportResult> = { data: { imported: ids.length, dealIds: ids }, error: null };
	return c.json(body, 201);
});

function importFailed(c: Parameters<typeof errorResponse>[0], errors: { row: number; message: string }[]) {
	const body: ApiResponse<CsvImportResult> = { data: { imported: 0, errors }, error: null };
	return c.json(body, 422);
}
