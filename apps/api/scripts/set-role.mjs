// Sets a user's role (user, moderator or admin) by email, and records it in audit_log.
// Run from the repo root: `pnpm user:role someone@example.com admin` (uses apps/api/.env).
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const args = z
	.tuple([z.email().trim().toLowerCase(), z.enum(['user', 'moderator', 'admin'])])
	.safeParse(process.argv.slice(2));
if (!args.success) {
	console.error('Usage: pnpm user:role <email> <user|moderator|admin>');
	process.exit(1);
}
const [email, role] = args.data;

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

// Find the auth user by email (page through users; fine for the user counts of R1).
let user = null;
for (let page = 1; !user; page++) {
	const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
	if (error) throw error;
	user = data.users.find((u) => u.email?.toLowerCase() === email) ?? null;
	if (data.users.length < 1000) break;
}
if (!user) {
	console.error(`No user with email ${email}. They must sign in once first.`);
	process.exit(1);
}

const { data: before, error: readError } = await db
	.from('profiles')
	.select('role')
	.eq('id', user.id)
	.single();
if (readError) throw readError;

const { error: updateError } = await db.from('profiles').update({ role }).eq('id', user.id);
if (updateError) throw updateError;

const { error: auditError } = await db.from('audit_log').insert({
	action: 'set_role',
	entity_type: 'profile',
	entity_id: user.id,
	diff: { role: { from: before.role, to: role } }
});
if (auditError) throw auditError;

console.log(`${email}: role ${before.role} -> ${role}`);
