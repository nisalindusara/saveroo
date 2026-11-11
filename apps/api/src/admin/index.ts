// All admin endpoints under /admin. Every request must come from a signed-in admin.
// Used only by the web admin area (apps/web/src/routes/admin).
import { Hono } from 'hono';
import { requireAdmin, requireUser, type AuthEnv } from '../auth';
import { deals } from './deals';
import { images } from './images';
import { csvImport } from './import';
import { merchants } from './merchants';
import { overview } from './overview';

export const admin = new Hono<AuthEnv>()
	.use('*', requireUser, requireAdmin)
	.route('/', overview)
	.route('/merchants', merchants)
	.route('/deals', deals)
	.route('/images', images)
	.route('/import', csvImport);
