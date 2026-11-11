// Builds `{ data: null, error }` JSON responses with a stable error code, and maps database errors.
// Used by every route and middleware that rejects a request.
import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiResponse } from '@saveroo/shared';

export function errorResponse(
	c: Context,
	status: ContentfulStatusCode,
	code: string,
	message: string,
	fields?: Record<string, string>
) {
	const body: ApiResponse<never> = { data: null, error: { code, message, ...(fields && { fields }) } };
	return c.json(body, status);
}

// Errors raised on purpose by the admin database functions (see the admin_tools migration).
const KNOWN_DB_ERRORS: Record<string, { status: ContentfulStatusCode; message: string; field?: string }> = {
	branch_not_of_merchant: { status: 422, message: 'A chosen branch belongs to another merchant.', field: 'branchIds' },
	card_not_of_provider: { status: 422, message: 'A chosen card does not belong to its bank or provider.', field: 'eligibility' },
	invalid_status_change: { status: 422, message: 'That status change is not allowed for this deal.' },
	deal_already_ended: { status: 422, message: 'This deal has already ended. Change the end date first.', field: 'endsAt' },
	deal_not_found: { status: 404, message: 'Deal not found.' },
	merchant_not_found: { status: 404, message: 'Merchant not found.' },
	branch_not_found: { status: 404, message: 'A branch was not found. Reload and try again.' }
};

/** Turns a supabase-js / Postgres error into a clear API error. */
export function dbErrorResponse(c: Context, error: { code?: string; message: string }) {
	const known = KNOWN_DB_ERRORS[error.message];
	if (known) {
		return errorResponse(c, known.status, error.message, known.message, known.field ? { [known.field]: known.message } : undefined);
	}
	if (error.code === '23505') {
		return errorResponse(c, 409, 'slug_taken', 'That web address (slug) is already used.', {
			slug: 'Already used'
		});
	}
	if (error.code === '23503') {
		return errorResponse(c, 422, 'invalid_reference', 'Something chosen no longer exists. Reload and try again.');
	}
	console.error('Database error', error.code, error.message);
	return errorResponse(c, 500, 'internal', 'Something went wrong. Please try again.');
}
