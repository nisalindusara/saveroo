// Tests for GET /health and the not-found envelope.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { healthResponseSchema } from '@saveroo/shared';
import { app } from './index';

const supabaseEnv = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'test' };

afterEach(() => vi.unstubAllGlobals());

describe('GET /health', () => {
	it('reports not_configured when Supabase env is missing', async () => {
		const res = await app.request('/health', {}, {});
		expect(res.status).toBe(200);
		const body = healthResponseSchema.parse(await res.json());
		expect(body.data?.database).toBe('not_configured');
	});

	it('reports ok when Supabase answers', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 200 })));
		const res = await app.request('/health', {}, supabaseEnv);
		const body = healthResponseSchema.parse(await res.json());
		expect(body.data?.database).toBe('ok');
	});

	it('reports unreachable when Supabase fails', async () => {
		vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
		const res = await app.request('/health', {}, supabaseEnv);
		const body = healthResponseSchema.parse(await res.json());
		expect(body.data?.database).toBe('unreachable');
	});
});

describe('unknown routes', () => {
	it('return a not_found error envelope', async () => {
		const res = await app.request('/nope');
		expect(res.status).toBe(404);
		expect(await res.json()).toEqual({
			data: null,
			error: { code: 'not_found', message: 'No such endpoint.' }
		});
	});
});
