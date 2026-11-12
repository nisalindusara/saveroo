// Caching for public endpoints and a timing header for every response.
// `publicCache` keeps successful GET replies in memory for a short time (per Worker instance) and sets
// Cache-Control so browsers, and Cloudflare's edge once a custom domain is used, can cache them too.
// (The Cloudflare Cache API does nothing on workers.dev, and KV allows only 1,000 writes a day on free.)
import { createMiddleware } from 'hono/factory';

const MAX_ENTRIES = 500;
type Entry = { body: string; status: number; contentType: string; storedAt: number; expiresAt: number };
const memory = new Map<string, Entry>();

/** Test helper: empty the in-memory cache. */
export function clearPublicCache() {
	memory.clear();
}

function remember(key: string, entry: Entry) {
	memory.delete(key);
	memory.set(key, entry);
	// Map keeps insertion order: drop the oldest entries beyond the limit.
	while (memory.size > MAX_ENTRIES) memory.delete(memory.keys().next().value!);
}

/** Caches successful GET responses for `seconds`; adds Cache-Control, Age and X-Cache (HIT or MISS). */
export const publicCache = (seconds: number) =>
	createMiddleware(async (c, next) => {
		const cacheControl = `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=${seconds * 5}`;
		const url = new URL(c.req.url);
		const key = `${url.pathname}?${[...url.searchParams].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join('&')}`;
		const now = Date.now();

		const hit = c.req.method === 'GET' ? memory.get(key) : undefined;
		if (hit && hit.expiresAt > now) {
			return c.body(hit.body, hit.status as 200, {
				'Content-Type': hit.contentType,
				'Cache-Control': cacheControl,
				Age: String(Math.floor((now - hit.storedAt) / 1000)),
				'X-Cache': 'HIT'
			});
		}

		await next();
		c.header('X-Cache', 'MISS');
		if (c.req.method !== 'GET' || c.res.status !== 200) {
			c.header('Cache-Control', 'no-store');
			return;
		}
		c.header('Cache-Control', cacheControl);
		const body = await c.res.clone().text();
		remember(key, {
			body,
			status: c.res.status,
			contentType: c.res.headers.get('Content-Type') ?? 'application/json',
			storedAt: now,
			expiresAt: now + seconds * 1000
		});
	});

/** Adds `Server-Timing: app;dur=<ms>` so response times can be measured from outside. */
export const serverTiming = createMiddleware(async (c, next) => {
	const started = performance.now();
	await next();
	c.header('Server-Timing', `app;dur=${Math.round(performance.now() - started)}`, { append: true });
});
