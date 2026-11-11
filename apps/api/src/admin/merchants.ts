// Admin merchant endpoints: list, read (with branches) and save (create or update with branches).
// Mounted at /admin/merchants; every change is written to audit_log by the database.
import { Hono } from 'hono';
import { merchantInputSchema, type AdminMerchant, type AdminMerchantListItem, type ApiResponse } from '@saveroo/shared';
import type { AuthEnv } from '../auth';
import { dbErrorResponse, errorResponse } from '../errors';
import { readJson } from '../validate';
import { merchantToRpc, snapshotToMerchant } from './mappers';

export const merchants = new Hono<AuthEnv>()
	.get('/', async (c) => {
		const q = c.req.query('q')?.trim();
		let query = c
			.get('db')
			.from('merchants')
			.select('id, slug, name, status, merchant_branches(count), deals(count)')
			.eq('deals.status', 'live')
			.order('name')
			.limit(200);
		if (q) query = query.ilike('name', `%${q.replace(/[%_]/g, '')}%`);
		const { data, error } = await query;
		if (error) return dbErrorResponse(c, error);
		const body: ApiResponse<AdminMerchantListItem[]> = {
			data: data.map((m) => ({
				id: m.id,
				slug: m.slug,
				name: m.name,
				status: m.status,
				branchCount: m.merchant_branches[0]?.count ?? 0,
				liveDealCount: m.deals[0]?.count ?? 0
			})),
			error: null
		};
		return c.json(body);
	})

	.get('/:id', async (c) => {
		const { data, error } = await c.get('db').rpc('merchant_snapshot', { p_merchant_id: c.req.param('id') });
		if (error) return dbErrorResponse(c, error);
		if (!data) return errorResponse(c, 404, 'merchant_not_found', 'Merchant not found.');
		const body: ApiResponse<AdminMerchant> = {
			data: snapshotToMerchant(data as Record<string, unknown>),
			error: null
		};
		return c.json(body);
	})

	.post('/', async (c) => {
		const input = await readJson(c, merchantInputSchema);
		if (!input.ok) return input.response;
		const { data: id, error } = await c
			.get('db')
			.rpc('admin_save_merchant', merchantToRpc(c.get('user').id, input.data));
		if (error) return dbErrorResponse(c, error);
		const body: ApiResponse<{ id: string }> = { data: { id }, error: null };
		return c.json(body, input.data.id ? 200 : 201);
	});
