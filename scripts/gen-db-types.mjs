// Generates TypeScript types for the database into packages/shared/src/database.types.ts.
// Run with `pnpm db:types` after changing migrations (needs the local database running).
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const out = new URL('../packages/shared/src/database.types.ts', import.meta.url);
const header =
	'// Database types generated from supabase/migrations by `pnpm db:types`. Do not edit by hand.\n' +
	'// Used through @saveroo/shared by the API (and later the web app) for typed queries.\n';

const types = execSync('pnpm exec supabase gen types typescript --local --schema public', {
	encoding: 'utf8'
});
writeFileSync(out, header + types.replace(/\r\n/g, '\n'));
console.log('Wrote packages/shared/src/database.types.ts');
