# Architecture

## Principles
- Fast on a cheap Android phone over a weak 4G connection.
- Simple: few moving parts, one language, one way to do each thing.
- Free tiers until revenue exists, with a clear upgrade path.
- Designed for the full vision (`features.md`), built in releases.
- Edge-first: serve cached data close to users; keep servers thin.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (strict) everywhere | One language across web, API, mobile, extension |
| Repo | pnpm workspaces monorepo | Shared types and validation between all apps |
| Web | SvelteKit (adapter-cloudflare) + Tailwind CSS | Server-rendered for SEO and fast first paint, very small JS bundles, runs on Cloudflare's free plan |
| API | Hono on Cloudflare Workers | Tiny and fast; one API for web, mobile and extension; cron triggers for background jobs |
| Database | Supabase Postgres (+ PostGIS, pg_trgm) | Relational data suits deals, cards, schedules; free plan; Mumbai region if offered, else Singapore |
| Auth | Supabase Auth | R1: email magic link and Google. Phone OTP later (SMS costs money) |
| Files | Supabase Storage (public `media` bucket) | No payment card needed (R2 asks for one, owner chose not to add one). Free plan: 1 GB stored, about 5 GB uncached + 5 GB cached downloads a month. Images are resized to WebP in the admin browser before upload, get unique names and a one-year cache. Move to R2 or a CDN if downloads approach the limit |
| Search | Postgres full-text + trigram | Typo tolerant and free; Meilisearch or Typesense later if needed |
| Cache | Cloudflare Cache API + KV | Hot feeds cached 60 seconds |
| Email | Resend | Free tier |
| Push | Web Push (VAPID) and Firebase Cloud Messaging (Android, later iOS) | Free |
| Mobile | Expo (React Native), expo-router, FlashList | One codebase for Android and iOS, shares TypeScript with everything else |
| Extension | WXT (Manifest V3) | One codebase for Chrome, Edge, Firefox; Safari via conversion later |
| Monitoring | Sentry (free), Cloudflare analytics | Errors and traffic |
| Product events | Own `events` table | Training data for later ML, no third-party lock-in |
| CI/CD | GitHub Actions; wrangler for Workers; Supabase CLI for migrations | Free |
| Tests | Vitest (unit), Playwright (web smoke), manual Android device checklist | Enough to catch regressions |

### Why not the alternatives
- **Next.js:** bundles can exceed Cloudflare Workers free-plan size limits. Verify before reconsidering.
- **Firebase/Firestore:** deals, cards, schedules and eligibility are relational; queries get awkward and costs are less predictable.
- **Flutter:** cannot share code with web, API and extension.
- **Heavy infrastructure (Kubernetes, microservices):** unnecessary and not free.

## Repo layout
```
apps/
  web/        SvelteKit: public pages, user app, /admin
  api/        Hono Worker: REST API, cron jobs, matching and notification workers
  mobile/     Expo app (from M11)
  extension/  WXT extension (R2)
packages/
  shared/     zod schemas, TypeScript types, constants, API client, t() i18n helper
supabase/
  migrations/ SQL migrations (only way to change the schema)
  seed/       reference data (categories, providers, card products)
docs/         this documentation
```

## How a request flows
Client (web, mobile, extension) -> Hono API on Cloudflare (validates with zod, checks JWT) -> Supabase Postgres. Public reads are cached at the edge. The web app server-renders public pages by calling the same API. Cron triggers run background jobs: expire deals, find users to notify, send reminders, keep the free database awake.

### Sign-in (M2)
- Web: `apps/web/src/hooks.server.ts` creates a Supabase client per request (`@supabase/ssr`) that keeps the login in HttpOnly cookies. All sign-in steps run on the server (form actions on `/login`, `/auth/callback`, `/logout`), so no auth JavaScript ships to the browser. `locals.getSession()` verifies the token (`getClaims`) before anything trusts it.
- Email sign-in link and Google both use the PKCE flow and return to `/auth/callback?next=...`; `next` is limited to paths inside the site (`safeNext`).
- API: `requireUser` (`apps/api/src/auth.ts`) verifies the `Authorization: Bearer` token against Supabase's public signing keys (ES256, fetched from `/auth/v1/.well-known/jwks.json` and cached 10 minutes), checks issuer and audience, then loads the role from `profiles`. `requireAdmin` adds the admin check. The web app passes the user's token to the API through `apiFetch(path, { accessToken })`.
- New users get a `profiles` row (role `user`) and default `notification_preferences` from the `on_auth_user_created` database trigger. Roles change only with `pnpm user:role <email> <role>` (logged in `audit_log`); a role screen in the admin tool can come later.
- The API reads and writes the database only with supabase-js and the secret key (`apps/api/src/db.ts`): the one data-access pattern.

### Admin tool (M3)
- Pages under `/admin` (web) call `/admin/*` API endpoints; every API call checks `requireUser` + `requireAdmin`.
- Writes go through database functions (`admin_save_merchant`, `admin_save_deal`, `admin_set_deal_status`, `admin_mark_deal_checked`, `admin_import_deals`) so a merchant with its branches, or a deal with its cards, days, branches and coupons, is saved all-or-nothing, and each change writes `audit_log` (before/after) in the same transaction. Only the service role may call them.
- Missing slugs are made in the database (`make_slug`: from the title, then `-2`, `-3`).
- Status rules: draft/pending/paused -> live (publish sets the first recheck in 14 days; refused if already ended), live -> paused, live/paused -> expired, pending -> rejected, paused/rejected -> draft.
- Expiry: the API cron (`*/5 * * * *`, `apps/api/src/jobs.ts`) runs `expire_deals()`, so a deal past `ends_at` is expired within 5 minutes; the same call keeps the free database active.
- Images: the admin's browser resizes to WebP at 320/640/1280 px (thumbnail at most 60 KB); the web passes the upload to `POST /admin/images`, which checks size and format and stores `<key>-<width>.webp` in the `media` bucket with a one-year cache. Columns store the image key; `imageUrl()` builds addresses.
- Workers free plan allows 50 outgoing requests per request, so bulk work (CSV import) is one database call, not one per row.
- Admin forms keep their state in Svelte and post one JSON `payload` field to a form action, which calls the API; API errors come back with per-field messages (`error.fields`).

## Performance budgets (requirements)
- Largest Contentful Paint at most 2.5 s on a mid-range Android over 4G.
- Initial JavaScript at most 150 KB gzipped on public pages.
- API p95 at most 300 ms for reads (at most 100 ms when cached).
- List screens scroll at 60 fps; Android cold start at most 2.5 s.
- Thumbnails at most 60 KB; all images WebP in 3 sizes; lazy loaded.
- Cursor pagination everywhere; never return unbounded lists.

## Security basics
- Row Level Security on every table; users can only read and write their own rows.
- Supabase service key lives only in the API Worker secrets.
- Validate every input with zod; check role on every admin route; log admin changes in `audit_log`.
- Rate limit public and auth endpoints.
- Supabase free plan has no point-in-time recovery: a scheduled GitHub Action exports the database weekly (milestone M12; destination to decide then, since R2 needs a payment card).
- Two environments: staging and production (two free Supabase projects).

## Conventions
- API responses: `{ data, error }`. Errors have a stable `code` and a human `message`. Lists use `{ data, nextCursor }`.
- Names: `snake_case` in the database, `camelCase` in TypeScript, `kebab-case` for files.
- IDs are UUIDs. Times are UTC in storage. Money is `numeric(12,2)` LKR.
- All user-facing text goes through `t()`.
- Every module opens with a 2-3 line comment saying what it does and where it is used.
- Browser code imports `t()` from `@saveroo/shared/i18n`, not from `@saveroo/shared`, so zod is not shipped to pages.
- Env vars: the web app declares them in `apps/web/src/env.ts` (zod-validated, read via `$app/env/private`); the API validates its env in `apps/api/src/env.ts`. Local values live in each app's git-ignored `.env`, copied from `.env.example`. Deployed secrets are set with `wrangler secret put`.
- Web server code calls the API only through `apiFetch()` in `apps/web/src/lib/server/api.ts`. Deployed, it uses the `API` service binding (Cloudflare blocks Worker-to-Worker fetches to workers.dev URLs on the same account, error 1042); in local dev it fetches `API_URL`. Cloudflare bindings are read with `import { env } from 'cloudflare:workers'` (SvelteKit 3 no longer passes them on `platform`).
- TypeScript is pinned to 6.x because SvelteKit 3 and typescript-eslint do not support 7 yet.
- pnpm's minimum release age check stays on: do not add `minimumReleaseAgeExclude` entries; use a version that has been out for a while instead.

## Verify at setup (limits change)
Check these on the vendors' pages in milestone M0 and record the result in `progress.md`:
- Cloudflare Workers free plan: request quota, CPU time per request, compressed bundle size.
- Supabase: free plan limits, pause policy, available regions (is Mumbai on free).
- Supabase Storage free quota (storage and downloads); Resend daily email limit; Firebase Cloud Messaging terms.
- Google Play developer account requirements (personal vs organization) when it is time to pay.
