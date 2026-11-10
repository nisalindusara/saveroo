# Windows setup

Commands change over time. Check each against the tool's official page if one fails. Run in Windows Terminal (PowerShell).

## 1. Accounts (free unless noted)
| Account | When | Notes |
|---|---|---|
| GitHub | Have it | Create a private repo `saveroo` |
| Cloudflare | M0 | Free. Skip any payment details |
| Supabase | M0 | Free. Create two projects: `saveroo-staging`, `saveroo-prod`. Pick the closest region (Mumbai if offered) |
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
npm install -g wrangler
```
- Supabase CLI: follow the install instructions at supabase.com/docs (Scoop or npm).
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

## 4. Starting a build session
1. Open a terminal in the repo folder and run `claude`.
2. Say: "Read CLAUDE.md and docs/progress.md, then start the current milestone."
3. At the end, ask for the plain-language summary and check `docs/progress.md` was updated.

## 5. Habits that prevent trouble
- One milestone per branch. Merge only when its "done when" list passes.
- Never paste secrets into chat or commit them. Use the `.env` file, which is git-ignored.
- If the project feels confusing after a few days, read `docs/codemap.md` and ask Claude to refresh it.
