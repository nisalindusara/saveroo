# Codemap

A living map of the codebase. Update it whenever files or modules are added, moved or removed. Keep each entry to one line.

Status: M2 sign-in (email link and Google, `/me`, admin-only `/admin`) on top of the M1 database.

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
- `packages/shared/src/auth.ts`: login email schema, user role and `/me` response schemas
- `supabase/migrations/*`: schema in order: extensions and helpers, reference data, merchants, profiles, deals, personalization, operations, profile-on-signup trigger
- `supabase/seed/*`: categories, providers, card products (card names are placeholders to verify)
- `packages/shared/src/i18n.ts`: `t()` and the English message table; browser code imports it from `@saveroo/shared/i18n`
- `apps/api/src/index.ts`: API entry, mounts routes, JSON 404
- `apps/api/src/env.ts`: validates Worker env (Supabase URL and secret key)
- `apps/api/src/db.ts`: `getDb()`, the API's supabase-js client (secret key); the only way the API touches the database
- `apps/api/src/errors.ts`: `errorResponse()` for `{ data: null, error }` replies
- `apps/api/src/auth.ts`: `requireUser` (verifies login token, loads role) and `requireAdmin` middleware
- `apps/api/src/health.ts`: `GET /health`, checks Supabase reachability
- `apps/api/src/me.ts`: `GET /me`, the signed-in user's id, email, role and profile basics
- `apps/api/scripts/set-role.mjs`: `pnpm user:role <email> <role>`, changes a user's role and logs it
- `apps/web/src/env.ts`: web env vars (API URL, Supabase URL and publishable key), validated with zod at start; read via `$app/env/private`
- `apps/web/src/hooks.server.ts`: per-request Supabase client (login cookies) and `locals.getSession()`
- `apps/web/src/lib/server/api.ts`: `apiFetch(path, { accessToken })`, the only way web server code calls the API (service binding when deployed, plain fetch in dev)
- `apps/web/src/lib/safe-next.ts`: keeps post-login redirects inside the site
- `apps/web/src/routes/+layout.*`: header with log in / log out (replaced by full navigation in M5)
- `apps/web/src/routes/login`: email link and Google sign-in; `auth/callback`: finishes sign-in; `logout`: POST to log out
- `apps/web/src/routes/admin`: admin-only area (guard in `+layout.server.ts`); M3 builds the tools here
- `apps/web/src/routes/+page.server.ts` / `+page.svelte`: M0 hello page showing API and database status

## Data flow notes
- Sign-in: `/login` form -> Supabase sends a link (or Google) -> `/auth/callback?code=` swaps it for a session in cookies -> back to `next`.
- `/admin`: web server reads the session -> `apiFetch('/me', { accessToken })` -> API verifies the token and reads the role -> web shows the page or 403.
- Hello page: browser -> `saveroo-web` server load -> `apiFetch('/health')` (the `API` service binding to `saveroo-api` when deployed) -> API checks `{SUPABASE_URL}/auth/v1/health` -> reply validated with `healthResponseSchema` -> page renders status.
