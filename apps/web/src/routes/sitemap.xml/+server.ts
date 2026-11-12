// GET /sitemap.xml: every public deal, merchant and category page for search engines (cached 1 hour).
import { apiGet } from '#lib/server/api.js';
import type { PublicSitemap } from '@saveroo/shared';
import type { RequestHandler } from './$types';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: RequestHandler = async ({ url }) => {
	const result = await apiGet<PublicSitemap>('/sitemap');
	if (!result.data) return new Response('Sitemap unavailable', { status: 503 });
	const origin = url.origin;
	const entry = (path: string, updatedAt?: string, priority = '0.6') =>
		`<url><loc>${escape(origin + path)}</loc>${updatedAt ? `<lastmod>${updatedAt.slice(0, 10)}</lastmod>` : ''}<priority>${priority}</priority></url>`;

	const urls = [
		entry('/', undefined, '1.0'),
		entry('/categories', undefined, '0.7'),
		...result.data.categories.map((c) => entry(`/categories/${c.slug}`, c.updatedAt, '0.7')),
		...result.data.merchants.map((m) => entry(`/merchants/${m.slug}`, m.updatedAt, '0.6')),
		...result.data.deals.map((d) => entry(`/deals/${d.slug}`, d.updatedAt, '0.8'))
	];
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
	return new Response(xml, { headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'public, max-age=3600' } });
};
