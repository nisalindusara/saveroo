// The response envelope every API endpoint uses: `{ data, error }`.
// The API builds these; clients validate them with `apiResponseSchema`.
import { z } from 'zod';

export const apiErrorSchema = z.object({
	code: z.string(),
	message: z.string(),
	// For invalid input: field path (e.g. "schedules.0.daysOfWeek") to a short message.
	fields: z.record(z.string(), z.string()).optional()
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export function apiResponseSchema<T extends z.ZodType>(data: T) {
	return z.object({
		data: data.nullable(),
		error: apiErrorSchema.nullable()
	});
}

export type ApiResponse<T> = { data: T; error: null } | { data: null; error: ApiError };
