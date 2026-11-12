// Public endpoints (no sign-in): feed, categories, category, merchant and deal pages, and search.
// Each makes one database call to a public_* function; replies are cached (see cache.ts).
import { Hono, type Context } from 'hono';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';
import {
	feedQuerySchema,
	searchQuerySchema,
	slugParamSchema,
	type ApiResponse,
	type Page,
	type PublicCategory,
	type PublicDeal,
	type PublicDealCard,
	type PublicMerchant,
	type PublicMerchantMatch
} from '@saveroo/shared';
import { publicCache } from './cache';
import { getDb, type Db } from './db';
import { readSupabaseEnv, type Bindings } from './env';
import { dbErrorResponse, errorResponse } from './errors';

type PublicEnv = { Bindings: Bindings; Variables: { db: Db } };
const PAGE_SIZE = 20;
const SEARCH_MAX_OFFSET = 200;

const useDb = createMiddleware<PublicEnv>(async (c, next) => {
	const supabase = readSupabaseEnv(c.env);
	if (!supabase) return errorResponse(c, 503, 'not_configured', 'The service is not configured.');
	c.set('db', getDb(supabase));
	await next();
});

// Cursors are opaque to clients: base64url JSON of the last row's sort keys (feed) or the offset (search).
const encode = (value: object) => btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function decode<T>(cursor: string | undefined, schema: z.ZodType<T>): T | null | 'invalid' {
	if (!cursor) return null;
	try {
		const parsed = schema.safeParse(JSON.parse(atob(cursor.replace(/-/g, '+').replace(/_/g, '/'))));
		return parsed.success ? parsed.data : 'invalid';
	} catch {
		return 'invalid';
	}
}
const feedCursorSchema = z.object({ t: z.iso.datetime({ offset: true }), i: z.uuid() });
const searchCursorSchema = z.object({ o: z.number().int().min(1).max(SEARCH_MAX_OFFSET) });

type FeedRow = { card: unknown; sort_ts: string; sort_id: string };

/** Runs public_feed with paging; returns the reply body or an error response. */
async function feedPage(
	c: Context<PublicEnv>,
	filters: { category?: string; merchant?: string },
	cursor: string | undefined
) {
	const after = decode(cursor, feedCursorSchema);
	if (after === 'invalid') return errorResponse(c, 400, 'invalid_cursor', 'Invalid page cursor.');
	const { data, error } = await c.get('db').rpc('public_feed', {
		p_category_slug: filters.category,
		p_merchant_slug: filters.merchant,
		p_after_ts: after?.t,
		p_after_id: after?.i,
		p_limit: PAGE_SIZE + 1
	});
	if (error) return dbErrorResponse(c, error);
	const rows = data as FeedRow[];
	const page = rows.slice(0, PAGE_SIZE);
	const last = page[page.length - 1];
	const body: Page<PublicDealCard> = {
		data: page.map((r) => r.card as PublicDealCard),
		nextCursor: rows.length > PAGE_SIZE && last ? encode({ t: last.sort_ts, i: last.sort_id }) : null,
		error: null
	};
	return c.json(body);
}

const invalidQuery = (c: Parameters<typeof errorResponse>[0], error: z.ZodError) =>
	errorResponse(c, 400, 'invalid_input', error.issues[0]?.message ?? 'Invalid query.');

export const publicRoutes = new Hono<PublicEnv>()
	// Newest public deals, optionally in one category (with its sub-categories).
	.get('/feed', publicCache(60), useDb, async (c) => {
		const query = feedQuerySchema.safeParse(c.req.query());
		if (!query.success) return invalidQuery(c, query.error);
		return feedPage(c, { category: query.data.category }, query.data.cursor);
	})

	.get('/categories', publicCache(300), useDb, async (c) => {
		const { data, error } = await c.get('db').from('categories').select('id, slug, name, icon, parent_id').order('sort_order');
		if (error) return dbErrorResponse(c, error);
		const children = (id: string) =>
			data.filter((x) => x.parent_id === id).map((x) => ({ slug: x.slug, name: x.name, icon: x.icon }));
		const body: ApiResponse<PublicCategory[]> = {
			data: data
				.filter((x) => !x.parent_id)
				.map((x) => ({ slug: x.slug, name: x.name, icon: x.icon, children: children(x.id) })),
			error: null
		};
		return c.json(body);
	})

	// Deals in one category; 404 when the category does not exist.
	.get('/categories/:slug', publicCache(60), useDb, async (c) => {
		const slug = slugParamSchema.safeParse(c.req.param('slug'));
		if (!slug.success) return errorResponse(c, 404, 'not_found', 'Category not found.');
		const { data: category, error } = await c.get('db').from('categories').select('slug').eq('slug', slug.data).maybeSingle();
		if (error) return dbErrorResponse(c, error);
		if (!category) return errorResponse(c, 404, 'not_found', 'Category not found.');
		return feedPage(c, { category: slug.data }, c.req.query('cursor'));
	})

	.get('/merchants/:slug', publicCache(60), useDb, async (c) => {
		const slug = slugParamSchema.safeParse(c.req.param('slug'));
		if (!slug.success) return errorResponse(c, 404, 'not_found', 'Merchant not found.');
		const { data, error } = await c.get('db').rpc('public_merchant', { p_slug: slug.data });
		if (error) return dbErrorResponse(c, error);
		if (!data) return errorResponse(c, 404, 'not_found', 'Merchant not found.');
		const body: ApiResponse<PublicMerchant> = { data: data as PublicMerchant, error: null };
		return c.json(body);
	})

	// The merchant's public deals, newest first.
	.get('/merchants/:slug/deals', publicCache(60), useDb, async (c) => {
		const slug = slugParamSchema.safeParse(c.req.param('slug'));
		if (!slug.success) return errorResponse(c, 404, 'not_found', 'Merchant not found.');
		return feedPage(c, { merchant: slug.data }, c.req.query('cursor'));
	})

	.get('/deals/:slug', publicCache(60), useDb, async (c) => {
		const slug = slugParamSchema.safeParse(c.req.param('slug'));
		if (!slug.success) return errorResponse(c, 404, 'not_found', 'Deal not found.');
		const { data, error } = await c.get('db').rpc('public_deal', { p_slug: slug.data });
		if (error) return dbErrorResponse(c, error);
		if (!data) return errorResponse(c, 404, 'not_found', 'This deal has ended or does not exist.');
		const body: ApiResponse<PublicDeal> = { data: data as PublicDeal, error: null };
		return c.json(body);
	})

	// Search: matching merchants (first page only) and deals, best matches first, typo tolerant.
	.get('/search', publicCache(60), useDb, async (c) => {
		const query = searchQuerySchema.safeParse(c.req.query());
		if (!query.success) return invalidQuery(c, query.error);
		const after = decode(query.data.cursor, searchCursorSchema);
		if (after === 'invalid') return errorResponse(c, 400, 'invalid_cursor', 'Invalid page cursor.');
		const offset = after?.o ?? 0;
		const db = c.get('db');

		const [deals, merchants] = await Promise.all([
			db.rpc('public_search_deals', { p_q: query.data.q, p_offset: offset, p_limit: PAGE_SIZE + 1 }),
			offset === 0 ? db.rpc('public_search_merchants', { p_q: query.data.q, p_limit: 5 }) : Promise.resolve({ data: [], error: null })
		]);
		if (deals.error) return dbErrorResponse(c, deals.error);
		if (merchants.error) return dbErrorResponse(c, merchants.error);
		const rows = deals.data as { card: unknown }[];
		const nextOffset = offset + PAGE_SIZE;
		return c.json({
			data: {
				merchants: (merchants.data as { merchant: unknown }[]).map((m) => m.merchant as PublicMerchantMatch),
				deals: rows.slice(0, PAGE_SIZE).map((r) => r.card as PublicDealCard)
			},
			nextCursor: rows.length > PAGE_SIZE && nextOffset <= SEARCH_MAX_OFFSET ? encode({ o: nextOffset }) : null,
			error: null
		});
	});
