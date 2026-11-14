# Codemap

A living map of the codebase. Update it whenever files or modules are added, moved or removed. Keep each entry to one line.

Status: M5 public web pages (owner's reference design) on top of the M4 public API, M3 admin tool, M2 sign-in and M1 database.

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
- `packages/shared/src/admin.ts`: admin input rules (merchant, branch, deal, cards, schedules, coupons), `issuesToFields`, admin reply types
- `packages/shared/src/time.ts`: Colombo time helpers (`colomboLocalToUtc`, `utcToColomboLocal`, `formatColombo`); browser-safe import `@saveroo/shared/time`
- `packages/shared/src/text.ts`: `parseCsv` for the CSV import
- `packages/shared/src/images.ts`: image widths, size limits, `imageUrl()`; browser-safe import `@saveroo/shared/images`
- `packages/shared/src/deal-text.ts`: `savingText`, `daysText`, `formatLkr` (admin preview, later public pages)
- `supabase/migrations/*`: schema in order: extensions and helpers, reference data, merchants, profiles, deals, personalization, operations, profile-on-signup trigger, admin tools, public reads (and their faster version)
- `supabase/seed/*`: categories, providers, card products (card names are placeholders to verify)
- `packages/shared/src/i18n.ts`: `t()` and the English message table; browser code imports it from `@saveroo/shared/i18n`
- `apps/api/src/index.ts`: API entry, mounts routes, JSON 404
- `apps/api/src/env.ts`: validates Worker env (Supabase URL and secret key)
- `apps/api/src/db.ts`: `getDb()`, the API's supabase-js client (secret key); the only way the API touches the database
- `apps/api/src/errors.ts`: `errorResponse()` for `{ data: null, error }` replies
- `apps/api/src/auth.ts`: `requireUser` (verifies login token, loads role) and `requireAdmin` middleware
- `apps/api/src/health.ts`: `GET /health`, checks Supabase reachability
- `apps/api/src/me.ts`: `GET /me`, the signed-in user's id, email, role and profile basics
- `apps/api/src/validate.ts`: `readJson(c, schema)` validates request bodies (400 with field messages)
- `apps/api/src/public.ts`: public endpoints (feed, categories, merchant, deal, search), one database call each
- `apps/api/src/cache.ts`: `publicCache` (in-memory cache + Cache-Control) and `serverTiming`
- `packages/shared/src/public.ts`: public reply types (`PublicDealCard`, `PublicDeal`, `PublicMerchant`, `Page`) and query rules
- `scripts/perf/*`: 2,000-deal test data (local only) and `measure.mjs` for the speed budget
- `apps/api/src/jobs.ts`: cron jobs (every 5 minutes): `expire_deals`
- `apps/api/src/admin/index.ts`: mounts `/admin/*`, all behind `requireUser` + `requireAdmin`
- `apps/api/src/admin/overview.ts`: dashboard, recheck queue, reference lists, audit log
- `apps/api/src/admin/merchants.ts`, `deals.ts`: list, read, save, duplicates, status, mark checked
- `apps/api/src/admin/images.ts`: stores browser-resized WebP images in the `media` bucket
- `apps/api/src/admin/import.ts`: CSV deal import (`rowToDeal`, all rows checked, one database call)
- `apps/api/src/admin/mappers.ts`: API shapes <-> database rows and function arguments
- `apps/api/scripts/set-role.mjs`: `pnpm user:role <email> <role>`, changes a user's role and logs it
- `apps/web/src/env.ts`: web env vars (API URL, Supabase URL and publishable key), validated with zod at start; read via `$app/env/private`
- `apps/web/src/hooks.server.ts`: per-request Supabase client (login cookies) and `locals.getSession()`
- `apps/web/src/lib/server/api.ts`: `apiFetch` / `apiCall`, the only way web server code calls the API (service binding when deployed, plain fetch in dev)
- `apps/web/src/lib/safe-next.ts`: keeps post-login redirects inside the site
- `apps/web/src/routes/+layout.*`: global styles, page transitions, signed-in user, image base address, Colombo weekday
- `apps/web/src/routes/login`: email link and Google sign-in; `auth/callback`: finishes sign-in; `logout`: POST to log out
- `apps/web/src/routes/admin`: admin-only area (guard in `+layout.server.ts`)
- `apps/web/src/lib/server/admin.ts`: `adminSession`, `readPayload`, `failLoad` for admin pages
- `apps/web/src/lib/admin/resize-image.ts`: browser-side resize to WebP in 3 widths
- `apps/web/src/lib/components/admin/*`: `DealForm`, `MerchantForm`, `ImageField`, `DealTable`, `StatusBadge`, `Field`
- `apps/web/src/lib/url.ts`: `withParam` for paging links
- `apps/web/src/routes/admin/*`: dashboard, `deals` (list, new, `[id]`, `[id]/preview`), `merchants` (list, new, `[id]`), `recheck`, `import`, `audit`, `images` (upload pass-through)
- `apps/web/src/routes/(site)/*`: public pages (home, search, categories, category, merchant, deal, me, login) and their frame (promo strip and banner on Home, header with category tabs, black stage with the white content panel, footer); `+layout.server.ts` loads the categories for the header and footer
- `apps/web/src/routes/data/*`: next pages of cards for infinite scroll; `sitemap.xml`, `robots.txt`: for search engines
- `apps/web/src/lib/components/public/*`: `DealCard`, `DealGrid`, `Rail`, `StoryCard`, `FeaturedCard`, `BrandCircles`, `HeroCarousel`, `PromoStrip`, `RooTag`, `WeekStrip`, `CouponTicket`, `CategoryChips`, `Section`, `TopBar`, `Logo`, `Icon` (also category icons), `Seo`, `ExternalLink`
- `apps/web/src/lib/public/cards.ts`: valid today, days left, card frame and badge, image sizes, colour posters; `share.ts`: WhatsApp and share sheet
- `packages/shared/src/providers.ts`: short bank names; `deal-text.ts` also has `savingTag` (Roo tag text)
- `apps/web/static/fonts`, `static/og-default.jpg`: Inter and Montserrat (OFL) and the default share image
- `docs/design.md`: the design system

## Data flow notes
- Public read: client -> `GET /feed` (API) -> `publicCache` (HIT returns at once) -> `public_feed()` (one database call, returns cards) -> `{ data, nextCursor }`.
- Admin save: form state -> hidden `payload` JSON -> page action -> `apiCall` -> `/admin/deals` -> zod check -> `admin_save_deal()` (deal + details + audit in one transaction).
- Image: admin browser resizes -> `/admin/images` (web) -> `POST /admin/images` (API) -> `media` bucket -> key saved on the merchant or deal.
- Sign-in: `/login` form -> Supabase sends a link (or Google) -> `/auth/callback?code=` swaps it for a session in cookies -> back to `next`.
- `/admin`: web server reads the session -> `apiFetch('/me', { accessToken })` -> API verifies the token and reads the role -> web shows the page or 403.
- Hello page: browser -> `saveroo-web` server load -> `apiFetch('/health')` (the `API` service binding to `saveroo-api` when deployed) -> API checks `{SUPABASE_URL}/auth/v1/health` -> reply validated with `healthResponseSchema` -> page renders status.
