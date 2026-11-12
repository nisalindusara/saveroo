// GET /data/feed?cursor=&category=&merchant=: the next page of deal cards for infinite scrolling.
// Used by the Masonry component in the browser; passes the request to the API's public feed.
import { json } from '@sveltejs/kit';
import { z } from 'zod';
import type { PublicDealCard } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { RequestHandler } from './$types';

const query = z.object({
	cursor: z.string().max(200),
	category: z.string().regex(/^[a-z0-9-]{1,120}$/).optional(),
	merchant: z.string().regex(/^[a-z0-9-]{1,120}$/).optional()
});

export const GET: RequestHandler = async ({ url }) => {
	const params = query.safeParse(Object.fromEntries(url.searchParams));
	if (!params.success) return json({ data: [], nextCursor: null }, { status: 400 });
	const { cursor, category, merchant } = params.data;
	const path = merchant
		? `/merchants/${merchant}/deals?cursor=${encodeURIComponent(cursor)}`
		: `/feed?cursor=${encodeURIComponent(cursor)}${category ? `&category=${category}` : ''}`;
	const result = await apiGet<PublicDealCard[]>(path);
	return json(
		{ data: result.data ?? [], nextCursor: result.nextCursor ?? null },
		{ status: result.status, headers: { 'Cache-Control': result.status === 200 ? 'public, max-age=60' : 'no-store' } }
	);
};
