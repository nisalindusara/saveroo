// Builds `{ data: null, error }` JSON responses with a stable error code.
// Used by every route and middleware that rejects a request.
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiResponse } from '@saveroo/shared';

export function errorResponse(
	c: Context,
	status: ContentfulStatusCode,
	code: string,
	message: string
) {
	const body: ApiResponse<never> = { data: null, error: { code, message } };
	return c.json(body, status);
}
