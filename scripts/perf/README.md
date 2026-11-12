# Performance checks

Tools for the API speed budget in `docs/architecture.md` (p95 at most 300 ms uncached, 100 ms cached).

## Local database with 2,000 test deals
1. Start Docker Desktop, then `pnpm db:start` and `pnpm db:reset` (empty database from the migrations).
2. Load the test data (local database only, never staging or production):
   `docker exec -i supabase_db_saveroo psql -U postgres < scripts/perf/seed-deals.sql`
3. Start the API against the local database (see `apps/api/.env.example`; use the local URL and secret key from `pnpm exec supabase status`).
4. `node scripts/perf/measure.mjs http://localhost:8787`

## Against staging
`node scripts/perf/measure.mjs https://saveroo-api.<account>.workers.dev` with `PERF_MERCHANT` and `PERF_DEAL` set to a real merchant and deal slug. Staging has little data, so this mostly measures network time between Cloudflare and the database; the local run measures the database work with 2,000 deals.

`measure.mjs` reads the server time from the `Server-Timing` header and exits with an error when a budget is missed.
