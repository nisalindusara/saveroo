# Location and alerts

## Valid-day reminders (R1, no location needed)
Many bank offers apply only on certain days. The deal stores its schedule (`deal_schedules`) and the deal page shows:

> Sampath card: 15% off every Tuesday. Next valid: Tue 17 Nov. [Remind me]

- "Remind me" creates a `reminders` row of kind `valid_day` for the morning of the next valid date (default 8:00 Asia/Colombo), then the next one after it passes, until the offer ends.
- Expiry reminders (kind `expiry`) fire 2 days before a saved deal ends.
- This solves the "we found the card offer at the counter, but it was a different day" case without any GPS.

## Notification rules (R1)
- Triggers: new deal matching a follow; reminder due; saved deal expiring; system messages.
- A matching job runs every 5 minutes: for deals with `notified_at is null` and status live, find followers, apply the wallet eligibility filter, create notifications, set `notified_at`.
- One notification per user per deal. Never duplicate.
- Respect `quiet_start`/`quiet_end` (default 22:00-07:00), `daily_cap` (default 5) and digest mode. Over-cap items go to the inbox only.
- Channels: in-app inbox always; push and email per preference. WhatsApp is R3.
- Every notification links to the deal. Every email has one-click unsubscribe.
- Relevance beats volume. Fewer, better alerts keep users from turning notifications off.

## Location principles
1. Ask for the minimum permission, at the moment it is useful, with a plain reason.
2. Everything must work without location. Location only makes things faster.
3. Never store raw location history. Coordinates in a request are used to answer it and then discarded.
4. Never sell or share location.
5. Show a visible indicator whenever location is being used.

## Without location (R1)
Choose a district or city, search a merchant by name, share a store link, or follow a merchant. "Nearby" is by district.

## Shopping Mode (R2, Android first)
For users who do not want to grant always-on location.
1. The user taps "I'm going shopping" and grants location for this session only ("only this time" or "while using the app").
2. While active: nearby offers and category deals (for example, passing a tech shop shows tech deals); entering a known merchant shows its best offer and the best card for the user's wallet, plus the next valid date if today does not qualify.
3. It ends automatically after a few hours or when the user taps stop. A persistent indicator shows while it is on.
4. Store only: session start and end, and merchants the user chose to open. Never the route.
5. If permission is refused: "Before you go" plan. The user picks where they are heading and Saveroo shows the best card and offers for those merchants.

## In-store product lookup (R2)
Search the exact product or scan its barcode to see matching offers and the best card to pay with. Quality depends on how many products and offers have been posted, so start with the biggest categories.

## Platform constraints to remember
- Background location on iOS and Android is restricted. Do not build core value on it.
- Android 13 and later asks for notification permission at runtime; ask in onboarding with a reason.
- Geofencing is optional later work, not R1 or R2 core.
