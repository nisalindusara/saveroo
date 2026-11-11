# Progress

Last updated: 2026-11-11

## Current milestone
**M3 Admin posting tool.** Code done on branch `feat/m3-admin` (CI green). Staging: database and API updated (expiry cron live); website uploaded as a preview (`https://m3-admin-saveroo-web.paranawithananisal19.workers.dev`), not yet live. Waiting on the owner's browser test.

M3 "done when" checklist:
- [x] Admin can create a merchant with branches and a deal with eligible cards, Tuesday-only schedule, coupon code and images, preview it and publish it: verified end to end through the website forms against local Supabase
- [x] Edits appear in the audit log (change log page, with before/after)
- [x] A deal past its end date becomes expired within 10 minutes: cron every 5 minutes, verified locally by triggering the job; database test
- [x] The recheck list shows deals due for checking ("Still running" moves the next check 14 days on)
- [x] Also built: CSV import with per-row error report, duplicate warnings, dashboard
- [ ] Owner tries it in a real browser on the preview (image resize runs in the browser and was not testable from the command line)
- [ ] Website promoted to live (`pnpm deploy:web`)

## Done
- 2026-11-11 M3 code: admin database functions (atomic saves with audit, status rules, recheck, expiry, duplicates, bulk import, slugs), public `media` bucket, `deals.image_url`; API `/admin/*` (merchants, deals, images, CSV import, dashboard, recheck, reference, audit) and 5-minute cron; web admin pages (dashboard, merchants, deal form with cards/days/coupons/images, preview, recheck, import, change log). Tests: 54 database, 15 API, 2 web, 24 shared.
- 2026-11-11 M2 merged (PR #3): email and Google sign-in, profiles, roles, `/me`, admin-only `/admin`.
- 2026-11-11 M2 code: sign-in with email link and Google (server-side, cookies via `@supabase/ssr`), `/auth/callback`, `/logout`, header with log in/out, admin-only `/admin`; API `requireUser` (verifies ES256 tokens with Supabase's public keys) and `requireAdmin`, `GET /me`; database trigger creates profile and notification settings on sign-up; `pnpm user:role` with audit log. Tests: 23 database, 12 API, 2 web, 4 shared. Cross-site form posts are rejected (403) in the deployed build. Staging: migration applied, API and website deployed; Supabase redirect URLs and Google sign-in configured by the owner.
- 2026-11-11 M1 merged (PR #2).
- 2026-11-11 M1: R1 schema in 7 migrations (reference data, merchants and branches, profiles, deals and details, personal data, operations), Row Level Security on every table (access table in `data-model.md`), seed data, 18 pgTAP database tests, generated types, CI `database` job. Docker Desktop installed on the owner's PC for the local database.
- 2026-11-10 M0 done and merged (PR #1): monorepo, CI, hello page and `/health` live on Cloudflare, Supabase staging connected.
- Planning complete: product, features by release, revenue model, architecture, data model, screens, Release 1 plan, location and alerts rules, Windows setup.
- 2026-11-10 M0 code: pnpm monorepo (`apps/web` SvelteKit 3 + Tailwind on Cloudflare, `apps/api` Hono Worker with `/health`, `packages/shared` with zod schemas and `t()`), Supabase CLI folder, GitHub Actions CI, root ESLint and TypeScript config. Lint, typecheck, tests (8) and production builds pass locally. Hello page initial JS is about 33 KB gzipped (budget 150 KB).
- 2026-11-10 Deployed `saveroo-api` and `saveroo-web` to Cloudflare. Fixed the live site saying "API not responding": Cloudflare blocks a Worker from fetching another Worker's workers.dev URL (error 1042), so web now calls the API through a service binding.
- Removed the earlier Next.js `web/` scaffold (empty placeholder files; still in git history, commit 7991e09, if its page list is useful for M5).

## Next
1. Owner: on the M3 preview address, create a merchant and a deal with a real photo, publish it, look at the preview, try the CSV example file. Report back.
2. Claude Code: promote the website, tick the boxes; owner reviews and merges the PR for `feat/m3-admin`. Then M4 (public API).
3. Owner: check the 40 placeholder card names in `supabase/seed/03_card_products.sql` against the banks' real card lists. M3 has no screen for editing banks, cards or categories (not in its scope); decide: corrections as a database migration made by Claude Code, or a small reference-data screen later.

## Limit checks (M0, checked 2026-11-10 on vendor pages)
- Cloudflare Workers free: 100,000 requests per day (resets 00:00 UTC), 10 ms CPU per request (waiting on network does not count), 64 MiB uncompressed Worker size, 128 MB memory, 50 external subrequests per request.
- Supabase free: 2 active projects, 500 MB database each, 2 GB disk (read-only at 95%), paused after 1 week of low activity (the planned keep-awake cron matters). Mumbai (ap-south-1) is available on the free plan, under "Specific regions" in the create-project dropdown (the default "Automatic" picked Sydney).
- R2 free: 10 GB-month storage, 1 million Class A (writes) and 10 million Class B (reads) per month, no egress fees (needs a payment card on file; not used, see decisions).
- Supabase Storage free: 1 GB stored, 5 GB uncached + 5 GB cached downloads a month, no image transformations, 50 MB max upload.
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
- 2026-11-11 Added `@supabase/supabase-js` (web and API) and `@supabase/ssr` (web), owner-approved. The API uses supabase-js for all database access (one pattern). Sign-in runs on the server; no auth JavaScript in the browser.
- 2026-11-11 First admin is set with `pnpm user:role` (logged in `audit_log`); later role changes move into the admin tool.
- 2026-11-11 Supabase's built-in email only reaches members of the Supabase organization. Before anyone else signs in, a custom email sender (Resend) is needed, which needs our own domain. Added to open items.
- 2026-11-11 Images stored in Supabase Storage (public `media` bucket) instead of Cloudflare R2, owner's choice: R2 needs a payment card on file. Free plan: 1 GB and about 10 GB downloads a month; images are small, uniquely named and cached for a year. Revisit if downloads approach the limit. The M12 database backup destination also needs a new choice (was R2).
- 2026-11-11 Admin writes go through database functions (all-or-nothing, audit in the same transaction); CSV import is one database call because Workers free allows 50 outgoing requests per request.
- 2026-11-11 Deal image column `deals.image_url` added (not in the original data model; addition only). Image columns store an image key, not a URL.
- 2026-11-11 Seed card products are generic placeholders (credit Visa, credit Mastercard, debit per bank; NTB Amex; telco loyalty and postpaid) until checked against real product lists.
- 2026-11-10 Supabase region: Mumbai (`ap-south-1`), the closest to Sri Lanka. Staging was first created in Sydney by "Automatic", then deleted and recreated in Mumbai while still empty. Create `saveroo-prod` in Mumbai too.
- 2026-11-10 TypeScript pinned to 6.x (SvelteKit 3 and typescript-eslint do not support 7 yet). Supabase CLI kept on 2.x until 3.x has been out a while.
- 2026-11-10 No Prettier for now (only ESLint). Can be added later if formatting drifts; would be a new dependency.

## Open items (owner)
- Buy saveroo.com after revenue starts. **Conflict to decide before testers sign in (by M8 or M13):** sign-in and alert emails to other people need a custom email sender (Resend), and Resend needs a domain we own. Options: buy the domain earlier (about USD 10-15 a year), or delay inviting testers.
- Company registration, then the Google Play developer account (USD 25).
- Survey other local deal platforms before launch.
- Legal review of privacy policy and terms.

## Blockers
None. M0 completion needs the owner's Cloudflare and Supabase accounts.
