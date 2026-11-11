// Admin overview endpoints: dashboard counts and lists, the recheck queue, reference data for the
// pickers (categories, brands, providers, cards) and the audit log. Mounted at /admin.
import { Hono } from 'hono';
import { z } from 'zod';
import type { AdminDashboard, AdminReference, ApiResponse, AuditEntry } from '@saveroo/shared';
import type { AuthEnv } from '../auth';
import { dbErrorResponse, errorResponse } from '../errors';
import { DEAL_LIST_COLUMNS, toListItem } from './deals';

const EXPIRING_DAYS = 7;

export const overview = new Hono<AuthEnv>()
	.get('/dashboard', async (c) => {
		const db = c.get('db');
		const now = new Date().toISOString();
		const soon = new Date(Date.now() + EXPIRING_DAYS * 86_400_000).toISOString();
		const count = () => db.from('deals').select('id', { count: 'exact', head: true });
		const list = () => db.from('deals').select(DEAL_LIST_COLUMNS).limit(10);

		const [live, drafts, expiring, recheck, expiringList, recheckList, draftList] = await Promise.all([
			count().eq('status', 'live'),
			count().eq('status', 'draft'),
			count().eq('status', 'live').gt('ends_at', now).lte('ends_at', soon),
			count().eq('status', 'live').lte('recheck_due_at', now),
			list().eq('status', 'live').gt('ends_at', now).lte('ends_at', soon).order('ends_at'),
			list().eq('status', 'live').lte('recheck_due_at', now).order('recheck_due_at'),
			list().eq('status', 'draft').order('updated_at', { ascending: false })
		]);
		const failed = [live, drafts, expiring, recheck, expiringList, recheckList, draftList].find((r) => r.error);
		if (failed?.error) return dbErrorResponse(c, failed.error);

		const body: ApiResponse<AdminDashboard> = {
			data: {
				counts: {
					live: live.count ?? 0,
					drafts: drafts.count ?? 0,
					expiringSoon: expiring.count ?? 0,
					needsRecheck: recheck.count ?? 0
				},
				expiringSoon: (expiringList.data ?? []).map(toListItem),
				needsRecheck: (recheckList.data ?? []).map(toListItem),
				drafts: (draftList.data ?? []).map(toListItem)
			},
			error: null
		};
		return c.json(body);
	})

	// Live deals due for a check within the next 3 days (overdue first).
	.get('/recheck', async (c) => {
		const until = new Date(Date.now() + 3 * 86_400_000).toISOString();
		const { data, error } = await c
			.get('db')
			.from('deals')
			.select(DEAL_LIST_COLUMNS)
			.eq('status', 'live')
			.lte('recheck_due_at', until)
			.order('recheck_due_at')
			.limit(200);
		if (error) return dbErrorResponse(c, error);
		return c.json({ data: data.map(toListItem), error: null });
	})

	.get('/reference', async (c) => {
		const db = c.get('db');
		const [categories, brands, providers, cards] = await Promise.all([
			db.from('categories').select('id, slug, name, parent_id').order('sort_order'),
			db.from('brands').select('id, slug, name').order('name'),
			db.from('providers').select('id, slug, name, type').order('name'),
			db.from('card_products').select('id, provider_id, name, card_type, network').order('name')
		]);
		const failed = [categories, brands, providers, cards].find((r) => r.error);
		if (failed?.error) return dbErrorResponse(c, failed.error);
		const body: ApiResponse<AdminReference> = {
			data: {
				categories: (categories.data ?? []).map((r) => ({ id: r.id, slug: r.slug, name: r.name, parentId: r.parent_id })),
				brands: brands.data ?? [],
				providers: providers.data ?? [],
				cardProducts: (cards.data ?? []).map((r) => ({
					id: r.id,
					providerId: r.provider_id,
					name: r.name,
					cardType: r.card_type,
					network: r.network
				}))
			},
			error: null
		};
		c.header('Cache-Control', 'private, max-age=60');
		return c.json(body);
	})

	// Newest first; filter by one entity to see its history. Cursor = created_at of the last row.
	.get('/audit', async (c) => {
		const params = z
			.object({
				entityType: z.enum(['deal', 'merchant', 'profile']).optional(),
				entityId: z.uuid().optional(),
				before: z.iso.datetime({ offset: true }).optional()
			})
			.safeParse(c.req.query());
		if (!params.success) return errorResponse(c, 400, 'invalid_input', 'Invalid filters.');
		const { entityType, entityId, before } = params.data;

		let query = c
			.get('db')
			.from('audit_log')
			.select('id, actor_id, action, entity_type, entity_id, diff, created_at, profiles(display_name)')
			.order('created_at', { ascending: false })
			.limit(50);
		if (entityType) query = query.eq('entity_type', entityType);
		if (entityId) query = query.eq('entity_id', entityId);
		if (before) query = query.lt('created_at', before);
		const { data, error } = await query;
		if (error) return dbErrorResponse(c, error);

		// Admins who signed up by email have no display name: show their email instead.
		// Few distinct actors per page (capped at 10 lookups to stay within Workers request limits).
		const db = c.get('db');
		const unnamed = [...new Set(data.filter((r) => r.actor_id && !r.profiles?.display_name).map((r) => r.actor_id!))];
		const emails = new Map<string, string>();
		await Promise.all(
			unnamed.slice(0, 10).map(async (actorId) => {
				const { data: found } = await db.auth.admin.getUserById(actorId);
				if (found.user?.email) emails.set(actorId, found.user.email);
			})
		);

		const entries: AuditEntry[] = data.map((r) => ({
			id: r.id,
			actorName: r.profiles?.display_name ?? (r.actor_id ? (emails.get(r.actor_id) ?? null) : null),
			action: r.action,
			entityType: r.entity_type,
			entityId: r.entity_id,
			diff: r.diff,
			createdAt: r.created_at
		}));
		return c.json({
			data: entries,
			nextCursor: entries.length === 50 ? entries[entries.length - 1]!.createdAt : null,
			error: null
		});
	});
