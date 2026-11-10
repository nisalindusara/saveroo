# Release 1: Launch (web, PWA, Android)

## Scope
Deals feed and search, merchant pages, My Wallet with best card and valid days, saves, follows and alerts, share-to-Saveroo, accounts, and the admin posting tool. Built on the full-vision architecture, so later releases add features instead of rebuilding.

## Not in Release 1
Ads and affiliate earning (the `affiliate_url` field exists, ads switch on in R2), premium, browser extension, Shopping Mode, community posting, price history, iOS, languages other than English, merchant portal, cashback, receipt scanning, machine learning (events are logged from day one).

## Definition of done (every milestone)
Typecheck, lint and tests pass; deployed to staging; docs and `progress.md` updated; owner gets a plain-language summary and a way to check it.

## Milestones (in order)

### M0 Project setup
Repo, monorepo skeleton, CI, Supabase and Cloudflare projects, environment files, hello-world deploy. Record the limit checks from `architecture.md`.
**Done when:** `pnpm dev` runs web and API locally; CI runs lint, typecheck and tests on every push; a hello page and `/health` endpoint are live on free Cloudflare URLs; Supabase dev project is connected; `.env.example` exists; the Commands section of `CLAUDE.md` is filled in.

### M1 Database foundation
Migrations for all R1 tables, Row Level Security, seed data, generated types.
**Done when:** migrations apply from an empty database; every R1 table exists with RLS; seed loads categories, about 15 providers and about 40 card products; types are generated into `packages/shared`; a test proves a normal user cannot read another user's wallet.

### M2 Auth and profiles
Email magic link and Google sign-in, profile on first login, roles, API verifies the session.
**Done when:** sign up, log out and log in work on web; an admin can open `/admin` and a normal user cannot.

### M3 Admin posting tool
Merchants, branches, deals, eligibility, valid days, coupons, images (resized in the browser to WebP in 3 sizes), preview, publish, pause, CSV import, audit log, automatic expiry job, recheck list.
**Done when:** an admin can create a merchant with branches and a deal with eligible cards, Tuesday-only schedule, a coupon code and images, preview it and publish it; edits appear in the audit log; a deal past its end date becomes expired within 10 minutes; the recheck list shows deals due for checking.

### M4 Public API
Feed, search, category, merchant and deal endpoints with cursor pagination and edge caching.
**Done when:** on a seeded set of 2,000 test deals, read endpoints meet the p95 budget; typo search ("scop cinemas") finds the right merchant; cached responses carry correct headers.

### M5 Public web pages
Server-rendered Home, category, search, deal and merchant pages with SEO tags, sitemap and share preview images.
**Done when:** Lighthouse mobile performance is at least 90 on Home and Deal pages; layout works from 360 px; a shared deal link shows a preview image and title in WhatsApp and Facebook.

### M6 Wallet and best card
Onboarding card picker, My Wallet, "only deals I can use" filter, best card for a merchant, valid days with next valid date.
**Done when:** with test data, a user who owns the right card sees a Tuesday-only offer, "Next valid: Tue <date>", and that offer is hidden for a user without the card.

### M7 Saves, follows and reminders
Save a deal, follow merchants, brands, categories and keywords, "Remind me on valid day".
**Done when:** all four follow types work; Remind me creates the right reminder; next-valid-date tests pass for month ends, blackout dates and Asia/Colombo time.

### M8 Notifications
In-app inbox, email (Resend), web push, matching job, preferences, quiet hours, daily cap.
**Done when:** a new deal matching a follow creates exactly one notification per user; quiet hours and daily cap are respected; reminders fire within 5 minutes of their time; one-click unsubscribe works.

### M9 Share-to-Saveroo
PWA share target (Android), paste-a-link box, domain to merchant matching, "Request this store".
**Done when:** sharing a known merchant's link into Saveroo shows that merchant's best offers for the user's wallet; an unknown domain shows the search fallback and records a `store_requests` row.

### M10 PWA and performance pass
Installable, offline shell, cached last feed, budget audit.
**Done when:** the web app installs on Android; opens offline with the last feed; all budgets in `architecture.md` are met and recorded in `progress.md`.

### M11 Android app
Expo app with sign-in, feed, search, deal, merchant, wallet, saves and follows, notifications (Firebase push), share intent.
**Done when:** an internal test build installs on a real mid-range Android phone; every flow in `screens.md` core list works; cold start is at most 2.5 s.

### M12 Events, monitoring, hardening
Event logging, Sentry, rate limits, weekly database backup to R2.
**Done when:** view, search, save, follow and open-from-notification events appear in `events`; a deliberate error shows in Sentry; a backup has been restored once into a test project.

### M13 Release candidate
Content seeding, QA, closed testing.
**Done when:** at least 300 live deals across at least 8 categories and at least 12 banks or telcos; QA checklist passes on 3 devices; Google Play closed test is running; the owner approves. Legal review is handled by the owner outside this plan and gates public launch.
