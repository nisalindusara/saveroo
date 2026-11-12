// GET /robots.txt: lets search engines in (except admin and private pages) and points to the sitemap.
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) =>
	new Response(
		['User-agent: *', 'Allow: /', 'Disallow: /admin', 'Disallow: /me', 'Disallow: /login', 'Disallow: /data/', '', `Sitemap: ${url.origin}/sitemap.xml`, ''].join('\n'),
		{ headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' } }
	);
