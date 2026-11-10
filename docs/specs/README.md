# Feature specs

One short file per feature, written just before it is built, named `<milestone>-<feature>.md` (for example `m6-wallet.md`). Delete nothing; mark a spec `Status: shipped` when done.

## Template
```
# <Feature>
Milestone: <M#>   Status: draft | building | shipped

## Goal
One or two sentences: what the user can do afterwards.

## User flow
Numbered steps from the user's point of view.

## Data
Tables and columns touched (link to `data-model.md`). Any new migration.

## API
Endpoints with request and response shapes.

## Edge cases
What can go wrong or be empty.

## Done when
Checks that prove it works (copy from `release-1.md` and add detail).
```
