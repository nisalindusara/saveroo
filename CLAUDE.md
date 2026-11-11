# Saveroo

Saveroo is a free deals and savings app for Sri Lanka (web + PWA, Android, browser extension, later iOS). It tells people the best deal, the best bank card and the best day *before* they pay. Brand goal: the first name Sri Lankans think of when they spend money.

## Start of every session
1. Read `docs/progress.md` (current milestone, what is next, open decisions).
2. Read `docs/README.md` (index) and open only the docs relevant to the task. Do not read every doc.
3. Work on the current milestone only. Do not build ahead of it.

## End of every session
- Update `docs/progress.md` (what was done, what is next, decisions made).
- Update `docs/codemap.md` if files or modules were added, moved or removed.
- If the code changes something a doc describes, update that doc in the same change.
- Tell the owner in plain language what changed and how to check it. The owner reviews and approves; they do not write code.

## Stack (details in `docs/architecture.md`)
TypeScript (strict) everywhere. pnpm monorepo. Web: SvelteKit on Cloudflare. API: Hono on Cloudflare Workers. DB/Auth: Supabase (Postgres). Files: Cloudflare R2. Mobile: Expo (React Native). Extension: WXT. Everything must run on free tiers until revenue exists.

## Commands
Run from the repo root.
- `pnpm install`: install everything (first time: copy `apps/web/.env.example` to `apps/web/.env`, same for `apps/api`).
- `pnpm dev`: web on http://localhost:5173, API on http://localhost:8787.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`: the same checks CI runs on every push.
- `pnpm build`: production build of web and API.
- `pnpm db:new <name>`: create a new SQL migration file. `pnpm db:migrate`: apply migrations to the linked (staging) Supabase project.
- Local database (needs Docker Desktop running): `pnpm db:start` / `pnpm db:stop`; `pnpm db:reset` rebuilds it from the migrations and seed; `pnpm db:test` runs the database tests; `pnpm db:types` regenerates `packages/shared/src/database.types.ts` (run after every migration; CI fails if it is stale).
- `pnpm deploy:api`, `pnpm deploy:web`: deploy to Cloudflare (needs `pnpm exec wrangler login` once).
- `pnpm user:role <email> <user|moderator|admin>`: change a user's role in the Supabase project in `apps/api/.env` (they must have signed in once).

## Rules
- **Simplicity over cleverness.** One way to do each thing: one validation library (zod), one data-fetching pattern, one styling approach. Before adding a second way, stop and ask.
- **Keep the codebase understandable.** Every module starts with a 2-3 line comment: what it does and where it is used. Keep `docs/codemap.md` current.
- **Ask before** adding a dependency, changing the stack, or changing the data model in a way that breaks `docs/data-model.md`.
- **Validate all external input** with zod schemas from `packages/shared`.
- **Database changes only through SQL migration files** in `supabase/migrations`. Never edit the database by hand. Row Level Security on every table.
- **No secrets in git.** Maintain `.env.example`. Service keys exist only in the API Worker.
- **Performance budgets are requirements**, not goals (see `docs/architecture.md`).
- **Privacy:** ask for the minimum permissions; never store raw location history; never sell or share individual user data. Aggregated, anonymous insights only.
- **Language:** English UI for now, but every user-facing string goes through the `t()` helper so Sinhala and Tamil can be added later.
- **Money and time:** LKR as `numeric(12,2)`; store times in UTC, display in Asia/Colombo.
- **Git:** small commits, Conventional Commit messages, feature branches, never commit to `main` directly.
- **Definition of done** for any milestone: typecheck, lint and tests pass; deployed to staging; docs and `progress.md` updated.
