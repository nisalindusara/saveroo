# Codemap

A living map of the codebase. Update it whenever files or modules are added, moved or removed. Keep each entry to one line.

Status: M1 database foundation (all R1 tables with RLS; app code is still the M0 hello page and `/health`).

## Structure
- `apps/web`: SvelteKit app (public pages, user app, `/admin`), deployed as Cloudflare Worker `saveroo-web`
- `apps/api`: Hono Worker (REST API, cron jobs), deployed as Cloudflare Worker `saveroo-api`
- `apps/mobile`: Expo app (from M11, not created yet)
- `apps/extension`: WXT extension (R2, not created yet)
- `packages/shared`: zod schemas, types, constants, `t()` helper (API client added in M4)
- `supabase/config.toml`: Supabase CLI settings; `supabase/migrations`: SQL schema changes; `supabase/seed`: reference data (`*.sql`)
- `supabase/tests/database`: pgTAP tests for Row Level Security and seed data (`pnpm db:test`)
- `scripts/gen-db-types.mjs`: writes generated database types into `packages/shared` (`pnpm db:types`)
- `.github/workflows/ci.yml`: job `check` (lint, typecheck, tests) and job `database` (fresh database from migrations and seed, database tests, generated types up to date) on every push

## Root config
- `package.json`: workspace scripts (`dev`, `lint`, `typecheck`, `test`, `db:*`, `deploy:*`)
- `pnpm-workspace.yaml`: workspace folders; which packages may run install scripts
- `tsconfig.base.json`: strict TypeScript settings that api and shared extend (web extends SvelteKit's)
- `eslint.config.js`: one ESLint config for the whole repo

## Key modules
- `packages/shared/src/api.ts`: `{ data, error }` response envelope type and zod schema helper
- `packages/shared/src/health.ts`: `/health` response schema
- `packages/shared/src/database.types.ts`: generated `Database` types (tables, enums); never edit by hand
- `supabase/migrations/*`: schema in order: extensions and helpers, reference data, merchants, profiles, deals, personalization, operations
- `supabase/seed/*`: categories, providers, card products (card names are placeholders to verify)
- `packages/shared/src/i18n.ts`: `t()` and the English message table; browser code imports it from `@saveroo/shared/i18n`
- `apps/api/src/index.ts`: API entry, mounts routes, JSON 404
- `apps/api/src/env.ts`: validates Worker env (Supabase URL and secret key)
- `apps/api/src/health.ts`: `GET /health`, checks Supabase reachability
- `apps/web/src/env.ts`: web env vars, validated with zod at start; read via `$app/env/private`
- `apps/web/src/lib/server/api.ts`: `apiFetch()`, the only way web server code calls the API (service binding when deployed, plain fetch in dev)
- `apps/web/src/routes/+page.server.ts` / `+page.svelte`: M0 hello page showing API and database status

## Data flow notes
- Hello page: browser -> `saveroo-web` server load -> `apiFetch('/health')` (the `API` service binding to `saveroo-api` when deployed) -> API checks `{SUPABASE_URL}/auth/v1/health` -> reply validated with `healthResponseSchema` -> page renders status.
