// Environment variables for the web app, validated with zod when the app starts.
// Server code reads them from `$app/env/private`; locally they come from apps/web/.env.
import { defineEnvVars } from '@sveltejs/kit/env';
import { z } from 'zod';

export const variables = defineEnvVars({
	API_URL: {
		schema: z.url(),
		description: 'Base URL of the Saveroo API Worker, without a trailing slash.'
	}
});
