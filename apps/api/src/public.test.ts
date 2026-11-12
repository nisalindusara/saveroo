// Tests for the public endpoints and their caching (cache.ts). The database is replaced by a fake fetch
// that answers the public_* function calls.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from './index';
import { clearPublicCache } from './cache';

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'test' };

function card(n: number) {
	return {
		card: { slug: `deal-${n}`, title: `Deal ${n}` },
		sort_ts: new Date(Date.UTC(2026, 10, 30 - n)).toISOString(),
		sort_id: `6f1c1c4e-1111-4a2b-9c3d-${String(n).padStart(12, '0')}`
	};
}

/** Fake Supabase: counts calls per database function and returns `rows` for public_feed. */
function fakeDb(rows: unknown[]) {
	const calls: Record<string, number> = {};
	const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
		const url = String(input instanceof Request ? input.url : input);
		const fn = url.match(/\/rpc\/(\w+)/)?.[1] ?? 'table';
		calls[fn] = (calls[fn] ?? 0) + 1;
		if (fn === 'public_feed') return Response.json(rows);
		if (fn === 'public_deal') return Response.json(null);
		if (fn === 'public_search_deals') return Response.json([]);
		if (fn === 'public_search_merchants') return Response.json([{ merchant: { slug: 'scope-cinemas' }, score: 0.7 }]);
		return Response.json([]);
	});
	vi.stubGlobal('fetch', fetchMock);
	return calls;
}

afterEach(() => {
	vi.unstubAllGlobals();
	clearPublicCache();
});

describe('GET /feed', () => {
	it('returns a page with a next cursor when there are more rows', async () => {
		fakeDb(Array.from({ length: 21 }, (_, i) => card(i)));
		const res = await app.request('/feed', {}, env);
		const body = (await res.json()) as { data: unknown[]; nextCursor: string | null };
		expect(res.status).toBe(200);
		expect(body.data).toHaveLength(20);
		expect(body.nextCursor).toEqual(expect.any(String));
	});

	it('has no next cursor on the last page', async () => {
		fakeDb([card(1)]);
		const body = (await (await app.request('/feed', {}, env)).json()) as { nextCursor: string | null };
		expect(body.nextCursor).toBeNull();
	});

	it('is cached: second call is a HIT with Cache-Control and no database call', async () => {
		const calls = fakeDb([card(1)]);
		const first = await app.request('/feed?category=entertainment', {}, env);
		expect(first.headers.get('X-Cache')).toBe('MISS');
		expect(first.headers.get('Cache-Control')).toBe('public, max-age=60, s-maxage=60, stale-while-revalidate=300');
		const second = await app.request('/feed?category=entertainment', {}, env);
		expect(second.headers.get('X-Cache')).toBe('HIT');
		expect(second.headers.get('Cache-Control')).toContain('max-age=60');
		expect(second.headers.get('Age')).toBe('0');
		expect(await second.json()).toEqual(await first.json());
		expect(calls.public_feed).toBe(1);
	});

	it('rejects a bad cursor and a bad category, without caching the error', async () => {
		fakeDb([]);
		const badCursor = await app.request('/feed?cursor=not-a-cursor', {}, env);
		expect(badCursor.status).toBe(400);
		expect(badCursor.headers.get('Cache-Control')).toBe('no-store');
		expect((await app.request('/feed?category=Bad Slug!', {}, env)).status).toBe(400);
	});

	it('adds a Server-Timing header', async () => {
		fakeDb([]);
		const res = await app.request('/feed', {}, env);
		expect(res.headers.get('Server-Timing')).toMatch(/^app;dur=\d+$/);
	});
});

describe('GET /deals/:slug', () => {
	it('is 404 when the deal is not public, and the 404 is not cached', async () => {
		const calls = fakeDb([]);
		const res = await app.request('/deals/ended-deal', {}, env);
		expect(res.status).toBe(404);
		expect(res.headers.get('Cache-Control')).toBe('no-store');
		await app.request('/deals/ended-deal', {}, env);
		expect(calls.public_deal).toBe(2);
	});
});

describe('GET /search', () => {
	it('needs at least 2 characters', async () => {
		fakeDb([]);
		const res = await app.request('/search?q=a', {}, env);
		expect(res.status).toBe(400);
	});

	it('returns merchants on the first page', async () => {
		fakeDb([]);
		const body = (await (await app.request('/search?q=scop%20cinemas', {}, env)).json()) as {
			data: { merchants: { slug: string }[] };
			nextCursor: string | null;
		};
		expect(body.data.merchants[0]?.slug).toBe('scope-cinemas');
		expect(body.nextCursor).toBeNull();
	});
});
