# Progress

Last updated: 2026-11-11

## Current milestone
**M1 Database foundation.** All "done when" items met on branch `feat/m1-database` (CI green); waiting on owner review and merge.

M1 "done when" checklist:
- [x] Migrations apply from an empty database (locally with `pnpm db:reset`, and in CI on every push)
- [x] Every R1 table exists with RLS (a test fails if any public table has RLS off)
- [x] Seed loads 17 categories, 15 providers and 40 card products
- [x] Types generated into `packages/shared/src/database.types.ts` (CI fails if stale)
- [x] A test proves a normal user cannot read another user's wallet (also cannot add to or delete from it; checked that the test fails when the rule is broken)
- [x] Applied to staging (`saveroo-staging`, Mumbai): 7 of 7 migrations and the seed; Supabase linter finds no issues in `public`

## Done
- 2026-11-11 M1: R1 schema in 7 migrations (reference data, merchants and branches, profiles, deals and details, personal data, operations), Row Level Security on every table (access table in `data-model.md`), seed data, 18 pgTAP database tests, generated types, CI `database` job. Docker Desktop installed on the owner's PC for the local database.
- 2026-11-10 M0 done and merged (PR #1): monorepo, CI, hello page and `/health` live on Cloudflare, Supabase staging connected.
- Planning complete: product, features by release, revenue model, architecture, data model, screens, Release 1 plan, location and alerts rules, Windows setup.
- 2026-11-10 M0 code: pnpm monorepo (`apps/web` SvelteKit 3 + Tailwind on Cloudflare, `apps/api` Hono Worker with `/health`, `packages/shared` with zod schemas and `t()`), Supabase CLI folder, GitHub Actions CI, root ESLint and TypeScript config. Lint, typecheck, tests (8) and production builds pass locally. Hello page initial JS is about 33 KB gzipped (budget 150 KB).
- 2026-11-10 Deployed `saveroo-api` and `saveroo-web` to Cloudflare. Fixed the live site saying "API not responding": Cloudflare blocks a Worker from fetching another Worker's workers.dev URL (error 1042), so web now calls the API through a service binding.
- Removed the earlier Next.js `web/` scaffold (empty placeholder files; still in git history, commit 7991e09, if its page list is useful for M5).

## Next
1. Owner: open the PR for `feat/m1-database`, review and merge into `main`.
2. Claude Code: start M2 (auth and profiles: email magic link and Google sign-in, profile created on first login, roles, API verifies the session).
3. Owner (any time before M3): check the 40 placeholder card names in `supabase/seed/03_card_products.sql` against the banks' real card lists; corrections are made in the admin tool from M3.

## Limit checks (M0, checked 2026-11-10 on vendor pages)
- Cloudflare Workers free: 100,000 requests per day (resets 00:00 UTC), 10 ms CPU per request (waiting on network does not count), 64 MiB uncompressed Worker size, 128 MB memory, 50 external subrequests per request.
- Supabase free: 2 active projects, 500 MB database each, 2 GB disk (read-only at 95%), paused after 1 week of low activity (the planned keep-awake cron matters). Mumbai (ap-south-1) is available on the free plan, under "Specific regions" in the create-project dropdown (the default "Automatic" picked Sydney).
- R2 free: 10 GB-month storage, 1 million Class A (writes) and 10 million Class B (reads) per month, no egress fees.
- Resend free: 100 emails per day (UTC day), 3,000 per month, no overage on free. This caps email alerts in M8; push and in-app should carry most notifications.
- Firebase Cloud Messaging and Google Play: check at M11.

## Decisions log
- 2026-11-10 Name: Saveroo. Domain saveroo.com to be bought after first revenue; free Cloudflare address until then. Facebook handle owned; Instagram variant such as saverooLK.
- 2026-11-10 Owner machine: Windows. Claude Code does almost all implementation; owner reviews and approves.
- 2026-11-10 Stack chosen on fit and speed: TypeScript monorepo, SvelteKit web, Hono API on Cloudflare Workers, Supabase Postgres and Auth, R2 files, Expo mobile, WXT extension. Free tiers only for now.
- 2026-11-10 Release 1 scope: feed and search, merchant pages, My Wallet with best card and valid days, saves, follows and alerts, share-to-Saveroo, accounts, admin posting tool.
- 2026-11-10 Platform order: web, then Android, then browser extension, then iOS.
- 2026-11-10 Language: English first; language choice in onboarding comes in R3.
- 2026-11-10 Supply: offers posted manually at first; merchants approached after an audience exists.
- 2026-11-10 Revenue: staged model in `revenue-model.md`; premium only when it clearly pays for itself; aggregated data only, never individual data.
- 2026-11-10 Legal: owner handles it outside the build; no public users before it is done.
- 2026-11-10 Kept SvelteKit as planned; dropped the Next.js scaffold.
- 2026-11-10 Both web and API deploy as Cloudflare Workers (`saveroo-web`, `saveroo-api`); deploys are manual until M12.
- 2026-11-10 Web reaches the API through a Cloudflare service binding (`API` -> `saveroo-api`), not the public URL. Free, and faster than going over the internet. Only staging Supabase project created for now; `saveroo-prod` is created near launch so it does not get paused while idle.
- 2026-11-11 Database tests run locally with Docker Desktop (owner installed it) and in CI on every push. Claude Code may push feature branches; merging stays with the owner.
- 2026-11-11 Clients never write admin data or events directly: those tables have RLS with no client policies, and the API writes them with the service key. Users can edit their profile but never their role or points (column-level permissions).
- 2026-11-11 Seed card products are generic placeholders (credit Visa, credit Mastercard, debit per bank; NTB Amex; telco loyalty and postpaid) until checked against real product lists.
- 2026-11-10 Supabase region: Mumbai (`ap-south-1`), the closest to Sri Lanka. Staging was first created in Sydney by "Automatic", then deleted and recreated in Mumbai while still empty. Create `saveroo-prod` in Mumbai too.
- 2026-11-10 TypeScript pinned to 6.x (SvelteKit 3 and typescript-eslint do not support 7 yet). Supabase CLI kept on 2.x until 3.x has been out a while.
- 2026-11-10 No Prettier for now (only ESLint). Can be added later if formatting drifts; would be a new dependency.

## Open items (owner)
- Buy saveroo.com after revenue starts.
- Company registration, then the Google Play developer account (USD 25).
- Survey other local deal platforms before launch.
- Legal review of privacy policy and terms.

## Blockers
None. M0 completion needs the owner's Cloudflare and Supabase accounts.
