# Codemap

A living map of the codebase. Update it whenever files or modules are added, moved or removed. Keep each entry to one line.

Status: no code yet. Filled in from milestone M0.

## Structure (planned, see `architecture.md`)
- `apps/web`: SvelteKit app (public pages, user app, `/admin`)
- `apps/api`: Hono Worker (REST API, cron jobs)
- `apps/mobile`: Expo app (from M11)
- `apps/extension`: WXT extension (R2)
- `packages/shared`: zod schemas, types, constants, API client, `t()` helper
- `supabase/migrations`: SQL schema changes
- `supabase/seed`: reference data

## Key modules
(add as built: path, what it does, who uses it)

## Data flow notes
(add as built: how a request travels for each main flow)
