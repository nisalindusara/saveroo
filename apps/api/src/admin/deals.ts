// Admin deal endpoints: list, read, save (with branches, cards, schedules, coupons), possible
// duplicates, status changes (publish, pause, end) and "still running" checks. Mounted at /admin/deals.
import { Hono } from 'hono';
import { z } from 'zod';
import {
	dealInputSchema,
	dealStatusChangeSchema,
	dealStatusSchema,
	markCheckedSchema,
	type AdminDeal,
	type AdminDealListItem,
	type ApiResponse,
	type DuplicateDeal
} from '@saveroo/shared';
import type { AuthEnv } from '../auth';
import { dbErrorResponse, errorResponse } from '../errors';
import { readJson } from '../validate';
import { dealToRpc, snapshotToDeal } from './mappers';

const PAGE_SIZE = 50;
export const DEAL_LIST_COLUMNS =
	'id, slug, title, status, starts_at, ends_at, recheck_due_at, updated_at, merchants(name)';

type DealListRow = {
	id: string;
	slug: string;
	title: string;
	status: AdminDealListItem['status'];
	starts_at: string;
	ends_at: string | null;
	recheck_due_at: string | null;
	updated_at: string;
	merchants: { name: string } | null;
};

export function toListItem(r: DealListRow): AdminDealListItem {
	return {
		id: r.id,
		slug: r.slug,
		title: r.title,
		status: r.status,
		merchantName: r.merchants?.name ?? '',
		startsAt: r.starts_at,
		endsAt: r.ends_at,
		recheckDueAt: r.recheck_due_at,
		updatedAt: r.updated_at
	};
}

// Cursor = base64 of "updated_at|id" of the last row on the previous page (newest first).
const encodeCursor = (r: DealListRow) => btoa(`${r.updated_at}|${r.id}`);
function decodeCursor(cursor: string | undefined) {
	if (!cursor) return null;
	try {
		const [updatedAt, id] = atob(cursor).split('|');
		if (!updatedAt || !z.uuid().safeParse(id).success || Number.isNaN(Date.parse(updatedAt))) return null;
		return { updatedAt, id: id! };
	} catch {
		return null;
	}
}

const listQuerySchema = z.object({
	status: dealStatusSchema.optional(),
	merchantId: z.uuid().optional(),
	q: z.string().trim().max(100).optional(),
	cursor: z.string().max(200).optional()
});

export const deals = new Hono<AuthEnv>()
	.get('/', async (c) => {
		const params = listQuerySchema.safeParse(c.req.query());
		if (!params.success) return errorResponse(c, 400, 'invalid_input', 'Invalid filters.');
		const { status, merchantId, q, cursor } = params.data;

		let query = c
			.get('db')
			.from('deals')
			.select(DEAL_LIST_COLUMNS)
			.order('updated_at', { ascending: false })
			.order('id', { ascending: false })
			.limit(PAGE_SIZE);
		if (status) query = query.eq('status', status);
		if (merchantId) query = query.eq('merchant_id', merchantId);
		if (q) query = query.ilike('title', `%${q.replace(/[%_]/g, '')}%`);
		const after = decodeCursor(cursor);
		if (after) {
			query = query.or(
				`updated_at.lt.${after.updatedAt},and(updated_at.eq.${after.updatedAt},id.lt.${after.id})`
			);
		}

		const { data, error } = await query.returns<DealListRow[]>();
		if (error) return dbErrorResponse(c, error);
		const last = data.length === PAGE_SIZE ? data[data.length - 1] : undefined;
		return c.json({ data: data.map(toListItem), nextCursor: last ? encodeCursor(last) : null, error: null });
	})

	.get('/:id', async (c) => {
		const db = c.get('db');
		const { data: snapshot, error } = await db.rpc('deal_snapshot', { p_deal_id: c.req.param('id') });
		if (error) return dbErrorResponse(c, error);
		if (!snapshot) return errorResponse(c, 404, 'deal_not_found', 'Deal not found.');
		const s = snapshot as Record<string, unknown>;
		const { data: merchant } = await db.from('merchants').select('name').eq('id', String(s.merchant_id)).single();
		const body: ApiResponse<AdminDeal> = { data: snapshotToDeal(s, merchant?.name ?? ''), error: null };
		return c.json(body);
	})

	// Open deals at the same merchant with a similar title (shown as a warning on the deal page).
	.get('/:id/duplicates', async (c) => {
		const db = c.get('db');
		const { data: deal, error } = await db
			.from('deals')
			.select('merchant_id, title')
			.eq('id', c.req.param('id'))
			.maybeSingle();
		if (error) return dbErrorResponse(c, error);
		if (!deal) return errorResponse(c, 404, 'deal_not_found', 'Deal not found.');
		const { data: dupes, error: dupesError } = await db.rpc('admin_find_duplicate_deals', {
			p_merchant_id: deal.merchant_id,
			p_title: deal.title,
			p_exclude_id: c.req.param('id')
		});
		if (dupesError) return dbErrorResponse(c, dupesError);
		const body: ApiResponse<DuplicateDeal[]> = { data: (dupes ?? []) as DuplicateDeal[], error: null };
		return c.json(body);
	})

	.post('/', async (c) => {
		const input = await readJson(c, dealInputSchema);
		if (!input.ok) return input.response;
		const db = c.get('db');
		const { data: id, error } = await db.rpc('admin_save_deal', dealToRpc(c.get('user').id, input.data));
		if (error) return dbErrorResponse(c, error);

		// Warn (do not block) when the merchant already has an open deal with a similar title.
		const { data: dupes } = await db.rpc('admin_find_duplicate_deals', {
			p_merchant_id: input.data.merchantId,
			p_title: input.data.title,
			p_exclude_id: id
		});
		const body: ApiResponse<{ id: string; duplicates: DuplicateDeal[] }> = {
			data: { id, duplicates: (dupes ?? []) as DuplicateDeal[] },
			error: null
		};
		return c.json(body, input.data.id ? 200 : 201);
	})

	.post('/:id/status', async (c) => {
		const input = await readJson(c, dealStatusChangeSchema);
		if (!input.ok) return input.response;
		const { error } = await c.get('db').rpc('admin_set_deal_status', {
			p_actor: c.get('user').id,
			p_deal_id: c.req.param('id'),
			p_status: input.data.status
		});
		if (error) return dbErrorResponse(c, error);
		return c.json({ data: { status: input.data.status }, error: null });
	})

	.post('/:id/checked', async (c) => {
		const input = await readJson(c, markCheckedSchema);
		if (!input.ok) return input.response;
		const { error } = await c.get('db').rpc('admin_mark_deal_checked', {
			p_actor: c.get('user').id,
			p_deal_id: c.req.param('id'),
			p_recheck_days: input.data.recheckDays
		});
		if (error) return dbErrorResponse(c, error);
		return c.json({ data: { checked: true }, error: null });
	});
