// GET /data/search?q=&cursor=: the next page of search results (deal cards) for infinite scrolling.
// Used by the DealGrid component on the search page; passes the request to the API's search.
import { json } from '@sveltejs/kit';
import { searchQuerySchema, type PublicDealCard } from '@saveroo/shared';
import { apiGet } from '#lib/server/api.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const params = searchQuerySchema.safeParse(Object.fromEntries(url.searchParams));
	if (!params.success || !params.data.cursor) return json({ data: [], nextCursor: null }, { status: 400 });
	const result = await apiGet<{ deals: PublicDealCard[] }>(
		`/search?q=${encodeURIComponent(params.data.q)}&cursor=${encodeURIComponent(params.data.cursor)}`
	);
	return json(
		{ data: result.data?.deals ?? [], nextCursor: result.nextCursor ?? null },
		{ status: result.status, headers: { 'Cache-Control': result.status === 200 ? 'public, max-age=60' : 'no-store' } }
	);
};
