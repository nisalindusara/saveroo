// Reads a JSON request body and checks it with a shared zod schema.
// Used by every route that accepts input; invalid input becomes a 400 with per-field messages.
import type { Context } from 'hono';
import type { z } from 'zod';
import { issuesToFields } from '@saveroo/shared';
import { errorResponse } from './errors';

export async function readJson<T extends z.ZodType>(
	c: Context,
	schema: T
): Promise<{ ok: true; data: z.output<T> } | { ok: false; response: Response }> {
	let body: unknown;
	try {
		body = await c.req.json();
	} catch {
		return { ok: false, response: errorResponse(c, 400, 'invalid_json', 'The request body is not valid JSON.') };
	}
	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return {
			ok: false,
			response: errorResponse(c, 400, 'invalid_input', 'Please fix the highlighted fields.', issuesToFields(parsed.error))
		};
	}
	return { ok: true, data: parsed.data };
}
