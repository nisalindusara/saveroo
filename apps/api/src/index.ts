// Entry point of the Saveroo API Worker (Hono on Cloudflare Workers).
// Mounts every route module; web, mobile and extension all call this API.
import { Hono } from 'hono';
import type { Bindings } from './env';
import { errorResponse } from './errors';
import { health } from './health';
import { me } from './me';

const app = new Hono<{ Bindings: Bindings }>();

app.route('/health', health);
app.route('/me', me);

app.notFound((c) => errorResponse(c, 404, 'not_found', 'No such endpoint.'));

export default app;
