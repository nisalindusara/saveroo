// GET /me: the signed-in user's id, email, role and profile basics.
// Used by the web app to show who is signed in and to guard /admin.
import { Hono } from 'hono';
import type { ApiResponse, Me } from '@saveroo/shared';
import { requireUser, type AuthEnv } from './auth';

export const me = new Hono<AuthEnv>().get('/', requireUser, (c) => {
	const body: ApiResponse<Me> = { data: c.get('user'), error: null };
	c.header('Cache-Control', 'private, no-store');
	return c.json(body);
});
