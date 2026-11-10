# Windows setup

Commands change over time. Check each against the tool's official page if one fails. Run in Windows Terminal (PowerShell).

## 1. Accounts (free unless noted)
| Account | When | Notes |
|---|---|---|
| GitHub | Have it | Create a private repo `saveroo` |
| Cloudflare | M0 | Free. Skip any payment details |
| Supabase | M0 | Free. `saveroo-staging` now; `saveroo-prod` near launch. Region: do not leave it on "Automatic"; pick South Asia (Mumbai) under specific regions |
| Resend | M8 | Free email sending |
| Sentry | M12 | Free tier |
| Firebase | M11 | Free; for Android push |
| Google Play Console | M11-M13 | One-time USD 25. Check personal versus organization account rules first; consider waiting for company registration |
| Chrome Web Store | R2 | Small one-time fee |
| Apple Developer | R3 | Annual fee; last |

## 2. Tools to install
```
winget install Git.Git
winget install GitHub.cli
winget install OpenJS.NodeJS.LTS
winget install Microsoft.VisualStudioCode
```
Then, in a new terminal:
```
corepack enable
corepack prepare pnpm@latest --activate
```
- Wrangler (Cloudflare) and the Supabase CLI come with the repo: after `pnpm install`, run them as `pnpm exec wrangler ...` and `pnpm exec supabase ...`. No global install needed.
- Claude Code: follow the current install instructions in the Claude Code docs, then run `claude` inside the repo folder.
- Android Studio (emulator and SDK): install at M11, not before.

## 3. First-time repo setup
```
cd $HOME
mkdir Projects
cd Projects
gh auth login
git clone https://github.com/<your-username>/saveroo.git
```
Unzip the blueprint into the repo so `CLAUDE.md` is at the root and `docs/` beside it. Commit and push:
```
git add .
git commit -m "docs: add Saveroo blueprint"
git push
```

## 4. Connecting Cloudflare and Supabase (M0, once)
Run in the repo folder. Never paste keys into chat.
1. `pnpm install`, then copy `apps/web/.env.example` to `apps/web/.env` and `apps/api/.env.example` to `apps/api/.env`.
2. Supabase: in the `saveroo-staging` project open Project Settings > API Keys. Put the project URL and the secret key into `apps/api/.env`.
3. Link the CLI: `pnpm exec supabase login`, then `pnpm exec supabase link --project-ref <ref>` (the ref is the part before `.supabase.co`). It asks for the database password.
4. Run `pnpm dev` and open http://localhost:5173. "Database: Connected" means Supabase works.
5. Cloudflare: `pnpm exec wrangler login`, then `pnpm deploy:api`. Note the `https://saveroo-api.<you>.workers.dev` address it prints.
6. Give the API its settings: put the Supabase URL into `SUPABASE_URL` in `apps/api/wrangler.jsonc`, run `pnpm --filter @saveroo/api exec wrangler secret put SUPABASE_SECRET_KEY` and paste the key, then `pnpm deploy:api` again.
7. Put the API address into `API_URL` in `apps/web/wrangler.jsonc`, then `pnpm deploy:web`. Open the printed `saveroo-web` address: it should show API and Database as Connected.

## 5. Starting a build session
1. Open a terminal in the repo folder and run `claude`.
2. Say: "Read CLAUDE.md and docs/progress.md, then start the current milestone."
3. At the end, ask for the plain-language summary and check `docs/progress.md` was updated.

## 6. Habits that prevent trouble
- One milestone per branch. Merge only when its "done when" list passes.
- Never paste secrets into chat or commit them. Use the `.env` file, which is git-ignored.
- If the project feels confusing after a few days, read `docs/codemap.md` and ask Claude to refresh it.
