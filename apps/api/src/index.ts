// Entry point of the Saveroo API Worker (Hono on Cloudflare Workers).
// Mounts every route module and the scheduled jobs; web, mobile and extension all call this API.
import { Hono } from 'hono';
import { admin } from './admin';
import { serverTiming } from './cache';
import type { Bindings } from './env';
import { errorResponse } from './errors';
import { health } from './health';
import { runScheduledJobs } from './jobs';
import { me } from './me';
import { publicRoutes } from './public';

export const app = new Hono<{ Bindings: Bindings }>();

app.use('*', serverTiming);
app.route('/health', health);
app.route('/me', me);
app.route('/admin', admin);
app.route('/', publicRoutes);

app.notFound((c) => errorResponse(c, 404, 'not_found', 'No such endpoint.'));

export default {
	fetch: app.fetch,
	scheduled: (_controller, env, ctx) => {
		ctx.waitUntil(runScheduledJobs(env));
	}
} satisfies ExportedHandler<Bindings>;
