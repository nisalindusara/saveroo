# Progress

Last updated: 2026-11-10

## Current milestone
**M0 Project setup.** Not started.

## Done
- Planning complete: product, features by release, revenue model, architecture, data model, screens, Release 1 plan, location and alerts rules, Windows setup.

## Next
1. Owner: create the GitHub repo `saveroo`, create Cloudflare and Supabase accounts (free), install tools (see `dev-setup-windows.md`).
2. Owner: unzip this blueprint into the repo and push.
3. Claude Code: start M0 (see `release-1.md`), including the limit checks listed in `architecture.md`.

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

## Open items (owner)
- Buy saveroo.com after revenue starts.
- Company registration, then the Google Play developer account (USD 25).
- Survey other local deal platforms before launch.
- Legal review of privacy policy and terms.

## Blockers
None.
