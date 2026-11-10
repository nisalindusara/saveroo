// Entry point of the Saveroo API Worker (Hono on Cloudflare Workers).
// Mounts every route module; web, mobile and extension all call this API.
import { Hono } from 'hono';
import type { ApiResponse } from '@saveroo/shared';
import type { Bindings } from './env';
import { health } from './health';

const app = new Hono<{ Bindings: Bindings }>();

app.route('/health', health);

app.notFound((c) => {
	const body: ApiResponse<never> = {
		data: null,
		error: { code: 'not_found', message: 'No such endpoint.' }
	};
	return c.json(body, 404);
});

export default app;
