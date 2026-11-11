// Tests for login-token checks (requireUser, requireAdmin) and GET /me.
// Uses a real ES256 key pair; Supabase's key endpoint and database are replaced by a fake fetch.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import { meResponseSchema } from '@saveroo/shared';
import app from './index';
import { clearSigningKeysCache, requireAdmin, requireUser, type AuthEnv } from './auth';

const SUPABASE_URL = 'https://example.supabase.co';
const env = { SUPABASE_URL, SUPABASE_SECRET_KEY: 'test-secret' };
const USER_ID = '6f1c1c4e-1111-4a2b-9c3d-000000000001';

let privateKey: CryptoKey;
let publicJwk: JsonWebKey & { kid: string; alg: string };
let profileRole = 'user';

beforeAll(async () => {
	const pair = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
		'sign',
		'verify'
	])) as CryptoKeyPair;
	privateKey = pair.privateKey;
	publicJwk = {
		...((await crypto.subtle.exportKey('jwk', pair.publicKey)) as JsonWebKey),
		kid: 'test-key',
		alg: 'ES256'
	};
});

// Signs a JWT the way Supabase does: ES256 with the key id ("kid") in the header.
async function signJwt(payload: Record<string, unknown>, key: CryptoKey, kid = 'test-key') {
	const encode = (data: Uint8Array) =>
		btoa(String.fromCharCode(...data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	const json = (value: object) => encode(new TextEncoder().encode(JSON.stringify(value)));
	const input = `${json({ alg: 'ES256', typ: 'JWT', kid })}.${json(payload)}`;
	const signature = await crypto.subtle.sign(
		{ name: 'ECDSA', hash: 'SHA-256' },
		key,
		new TextEncoder().encode(input)
	);
	return `${input}.${encode(new Uint8Array(signature))}`;
}

function fakeSupabase() {
	return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
		const url = String(input instanceof Request ? input.url : input);
		if (url.endsWith('/auth/v1/.well-known/jwks.json')) {
			return Response.json({ keys: [publicJwk] });
		}
		if (url.startsWith(`${SUPABASE_URL}/rest/v1/profiles`)) {
			const row = { role: profileRole, display_name: 'Test User', onboarding_done: false };
			const accept = new Headers(init?.headers ?? (input instanceof Request ? input.headers : {}));
			const single = accept.get('Accept')?.includes('vnd.pgrst.object');
			return Response.json(single ? row : [row]);
		}
		return new Response('unexpected request', { status: 500 });
	});
}

async function token(overrides: Record<string, unknown> = {}) {
	const now = Math.floor(Date.now() / 1000);
	return signJwt(
		{
			sub: USER_ID,
			email: 'test@saveroo.lk',
			aud: 'authenticated',
			iss: `${SUPABASE_URL}/auth/v1`,
			iat: now,
			exp: now + 3600,
			...overrides
		},
		privateKey
	);
}

function getMe(authorization?: string, bindings: object = env) {
	const headers: Record<string, string> = authorization ? { Authorization: authorization } : {};
	return app.request('/me', { headers }, bindings);
}

afterEach(() => {
	vi.unstubAllGlobals();
	clearSigningKeysCache();
	profileRole = 'user';
});

describe('GET /me', () => {
	it('rejects requests without a token', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		const res = await getMe();
		expect(res.status).toBe(401);
		expect(meResponseSchema.parse(await res.json()).error?.code).toBe('unauthorized');
	});

	it('returns the signed-in user with their role', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		const res = await getMe(`Bearer ${await token()}`);
		expect(res.status).toBe(200);
		const body = meResponseSchema.parse(await res.json());
		expect(body.data).toEqual({
			id: USER_ID,
			email: 'test@saveroo.lk',
			role: 'user',
			displayName: 'Test User',
			onboardingDone: false
		});
	});

	it('rejects an expired token', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		const past = Math.floor(Date.now() / 1000) - 7200;
		const res = await getMe(`Bearer ${await token({ iat: past, exp: past + 3600 })}`);
		expect(res.status).toBe(401);
	});

	it('rejects a token from another Supabase project', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		const res = await getMe(`Bearer ${await token({ iss: 'https://evil.supabase.co/auth/v1' })}`);
		expect(res.status).toBe(401);
	});

	it('rejects a token signed with a different key', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		const other = (await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, [
			'sign',
			'verify'
		])) as CryptoKeyPair;
		const now = Math.floor(Date.now() / 1000);
		const forged = await signJwt(
			{ sub: USER_ID, aud: 'authenticated', iss: `${SUPABASE_URL}/auth/v1`, iat: now, exp: now + 3600 },
			other.privateKey
		);
		const res = await getMe(`Bearer ${forged}`);
		expect(res.status).toBe(401);
	});

	it('reports not_configured when Supabase env is missing', async () => {
		const res = await getMe(`Bearer ${await token()}`, {});
		expect(res.status).toBe(503);
	});
});

describe('requireAdmin', () => {
	const adminApp = new Hono<AuthEnv>().get('/admin-only', requireUser, requireAdmin, (c) =>
		c.text('ok')
	);

	it('blocks a normal user', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		const res = await adminApp.request(
			'/admin-only',
			{ headers: { Authorization: `Bearer ${await token()}` } },
			env
		);
		expect(res.status).toBe(403);
	});

	it('lets an admin through', async () => {
		vi.stubGlobal('fetch', fakeSupabase());
		profileRole = 'admin';
		const res = await adminApp.request(
			'/admin-only',
			{ headers: { Authorization: `Bearer ${await token()}` } },
			env
		);
		expect(res.status).toBe(200);
	});
});
