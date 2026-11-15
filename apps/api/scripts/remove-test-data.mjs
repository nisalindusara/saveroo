// Removes the design test data from the Supabase project in apps/api/.env: deals whose terms say
// "TEST DATA", merchants whose description says "TEST DATA", every promotion (promotions only hold test
// data until campaigns arrive in R4), and the pictures under media/test/.
// Run from the repo root: `pnpm testdata:remove` (add --yes to skip the question).
import { createInterface } from 'node:readline/promises';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const env = z
	.object({ SUPABASE_URL: z.url(), SUPABASE_SECRET_KEY: z.string().min(1) })
	.safeParse(process.env);
if (!env.success) {
	console.error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set in apps/api/.env');
	process.exit(1);
}
const db = createClient(env.data.SUPABASE_URL, env.data.SUPABASE_SECRET_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
});

const deals = await db.from('deals').select('id').like('terms', '%TEST DATA%');
const merchants = await db.from('merchants').select('id').like('description', '%TEST DATA%');
const promotions = await db.from('promotions').select('id');
for (const r of [deals, merchants, promotions]) if (r.error) throw r.error;
console.log(`Found ${deals.data.length} test deals, ${merchants.data.length} test merchants, ${promotions.data.length} promotions in ${env.data.SUPABASE_URL}.`);

if (!process.argv.includes('--yes')) {
	const rl = createInterface({ input: process.stdin, output: process.stdout });
	const answer = await rl.question('Delete them all? Type "yes": ');
	rl.close();
	if (answer.trim().toLowerCase() !== 'yes') {
		console.log('Nothing deleted.');
		process.exit(0);
	}
}

const check = (r) => {
	if (r.error) throw r.error;
};
if (deals.data.length) check(await db.from('deals').delete().in('id', deals.data.map((d) => d.id)));
if (merchants.data.length) check(await db.from('merchants').delete().in('id', merchants.data.map((m) => m.id)));
if (promotions.data.length) check(await db.from('promotions').delete().in('id', promotions.data.map((p) => p.id)));

// Pictures: everything under media/test/ (listed in pages of 1000).
let removed = 0;
for (;;) {
	const { data: files, error } = await db.storage.from('media').list('test', { limit: 1000 });
	if (error) throw error;
	if (!files.length) break;
	const { error: delError } = await db.storage.from('media').remove(files.map((f) => `test/${f.name}`));
	if (delError) throw delError;
	removed += files.length;
}
console.log(`Deleted ${deals.data.length} deals, ${merchants.data.length} merchants, ${promotions.data.length} promotions and ${removed} pictures.`);
