# Data model

Postgres on Supabase. Every table has `id uuid pk default gen_random_uuid()` and `created_at timestamptz default now()` (plus `updated_at` where rows are edited). Money is `numeric(12,2)` in LKR. Times are UTC, shown in Asia/Colombo. Row Level Security on every table. The release tag shows when a table is first needed; the schema is designed for all of them.

## Reference data (R1)
- **categories:** slug unique, name, parent_id fk self, icon, sort_order
- **brands:** slug unique, name, logo_url
- **providers:** slug unique, name, type enum(bank, telco, wallet, loyalty, network), logo_url
- **card_products:** provider_id fk, name, card_type enum(credit, debit, prepaid, loyalty, other), network enum(visa, mastercard, amex, unionpay, local, none)

## Merchants (R1)
- **merchants:** slug unique, name, description, logo_url, cover_url, website_url, domains text[] (used by share-to-Saveroo), phone, primary_category_id fk, is_online, has_physical_stores, is_verified, status enum(active, hidden)
- **merchant_branches:** merchant_id fk, name, address, city, district, location geography(Point,4326), opening_hours jsonb, phone, status

## Deals (R1)
- **deals:** merchant_id fk, slug unique, title, description, category_id fk, brand_id fk null, deal_type enum(percent_off, amount_off, bogo, freebie, cashback, coupon_code, price_drop, bundle, other), discount_percent null, discount_amount_lkr null, max_saving_lkr null, min_spend_lkr null, original_price_lkr null, deal_price_lkr null, terms, how_to_redeem, channel enum(in_store, online, both), source_url, proof_image_url, image_url (added M3), affiliate_url null, status enum(draft, pending, live, paused, expired, rejected), verification enum(verified, community, unverified), origin enum(admin, community, merchant), starts_at, ends_at null, last_checked_at, recheck_due_at, is_featured, featured_until null, notified_at null (set when the matching worker has processed it), created_by fk profiles, view_count
  - Indexes: (status, ends_at); (merchant_id); (category_id, status); GIN full-text on title and description; trigram on title.
- **deal_branches:** deal_id, branch_id. No rows means all branches.
- **deal_eligibility:** deal_id, provider_id fk, card_product_id fk null (null means any card of that provider), card_type null, note. No rows means open to everyone.
- **deal_schedules:** deal_id, days_of_week int[] (1=Mon to 7=Sun), start_time null, end_time null, valid_from date null, valid_to date null, blackout_dates date[], note. No rows means every day between starts_at and ends_at.
- **coupon_codes:** deal_id, code, kind enum(copy, show_qr, auto_apply), usage_limit null, used_count, valid_from, valid_to

## Users and personalization (R1)
- **profiles:** id = auth user id, display_name, avatar_url, district, language default 'en', role enum(user, moderator, admin), onboarding_done, points default 0
- **user_wallet:** user_id, provider_id, card_product_id null. Unique on the three.
- **follows:** user_id, target_type enum(merchant, brand, category, keyword, product), target_id null, keyword null
- **saved_deals:** user_id, deal_id, remind_before_expiry default true
- **reminders:** user_id, deal_id, kind enum(valid_day, expiry), remind_at, sent_at null
- **notifications:** user_id, type enum(new_deal, reminder, expiring, system), title, body, deal_id null, data jsonb, read_at null
- **notification_deliveries:** notification_id, channel enum(inapp, push, email, whatsapp), status enum(queued, sent, failed, skipped), sent_at, error
- **notification_preferences:** user_id pk, push, email, inapp default true, quiet_start, quiet_end, daily_cap default 5, digest enum(instant, daily, weekly)
- **push_tokens:** user_id, token unique, platform enum(web, android, ios), last_seen_at
- **consents:** user_id, kind enum(notifications, location, analytics, marketing), granted, granted_at
- **store_requests:** user_id null, url_or_domain, created_at (demand signal for stores to add)

## Operations (R1)
- **events:** id bigint identity, user_id null, anonymous_id, name, entity_type null, entity_id null, props jsonb, platform enum(web, android, ios, extension), app_version, created_at. Index (name, created_at). Plan monthly partitions and a retention period later.
- **audit_log:** actor_id, action, entity_type, entity_id, diff jsonb
- **feature_flags:** key unique, enabled, rollout_percent

## Later tables (designed now, built when needed)
- **R2:** products, deal_products, price_points (price history), wishlist_items, deal_reports, deal_votes, deal_comments, points_ledger, redemptions, shopping_sessions
- **R3:** referrals, badges, user_badges
- **R4:** merchant_users, campaigns (featured and sponsored), invoices
- **R5:** cashback_transactions, payouts, insight aggregates

## As built (M1)
R1 tables live in `supabase/migrations` (one file per area). Details beyond the lists above:
- Shared types: `slug` (lowercase words joined by hyphens) and `lkr` (`numeric(12,2)`, never negative). Enum names: `provider_type`, `card_type`, `card_network`, `merchant_status` (also used for branch status), `deal_type`, `deal_channel`, `deal_status`, `deal_verification`, `deal_origin`, `coupon_kind`, `user_role`, `follow_target`, `reminder_kind`, `notification_type`, `notification_channel`, `delivery_status`, `digest_frequency`, `app_platform` (push tokens and events), `consent_kind`.
- Extra rules: card product names are unique per provider; `discount_percent` is above 0 and at most 100; a deal's `ends_at` is after `starts_at`; `days_of_week` only holds 1-7; a follow has either a keyword or a target, never both; one wallet row per user, provider and card; one consent row per user and kind.
- Deletes: removing a user removes all their personal rows. Deals keep their merchant (a merchant with deals cannot be deleted; hide it instead). Removing a deal removes its branches, eligibility, schedules and coupons.
- `deals.search` is a generated full-text column (`simple` config, so words are kept as typed for mixed-language text).
- PostGIS and pg_trgm live in the `extensions` schema.
- Images (M3): `merchants.logo_url`, `merchants.cover_url`, `deals.image_url` and `deals.proof_image_url` hold an image key such as `deals/2026-11/a1b2c3d4e5f6a7b8`, not a full address. Files are `<key>-320.webp`, `-640.webp` and `-1280.webp` in the public Supabase Storage bucket `media`.
- Saving fields by deal type (M3, `SAVING_FIELDS` in `packages/shared/src/admin.ts`): percent_off uses discount_percent, max_saving_lkr, min_spend_lkr; amount_off uses discount_amount_lkr, min_spend_lkr; cashback and coupon_code use percent or amount, max saving, min spend; price_drop and bundle use original_price_lkr and deal_price_lkr; bogo, freebie and other use min_spend_lkr. The API clears the fields that do not apply.
- Admin writes (M3) go through database functions that also write `audit_log`; see `architecture.md`, "Admin tool".

### Who can read and write (Row Level Security)
| Tables | Visitors and signed-in users | Owner of the row |
|---|---|---|
| categories, brands, providers, card_products | read | |
| merchants, merchant_branches | read active ones | |
| deals, deal_branches, deal_eligibility, deal_schedules, coupon_codes | read when the deal is live and its merchant is active | |
| profiles | | read; edit name, avatar, district, language, onboarding (never role or points) |
| user_wallet, follows, saved_deals, reminders, notification_preferences, push_tokens, consents | | read, add, change, delete |
| notifications | | read, mark read, delete |
| notification_deliveries, store_requests, events, audit_log, feature_flags | none (API only) | |

All writes not listed go through the API, which uses the service key. Tests in `supabase/tests/database` check these rules.

## Key logic

### Usable deal
A deal is usable by a user when: status is live; now is between starts_at and ends_at; and either the deal has no `deal_eligibility` rows or at least one row matches the user's `user_wallet` (provider matches; if a card product is specified it matches; if a card type is specified it matches).

### Next valid date
Computed in Asia/Colombo from `deal_schedules`: the earliest date from today onward that matches days_of_week, lies within valid_from and valid_to, is not in blackout_dates, and is before ends_at. If none exists, show "no upcoming date". Unit-test this thoroughly, including month ends and blackout dates.

### Best deal for a merchant (for one user)
Among the user's usable deals at that merchant, rank by: valid today first, then max_saving_lkr, then discount_percent, then ends_at soonest. Show the card to use alongside it.

### Privacy rules in the schema
- No table stores raw GPS history. Nearby queries use coordinates sent with the request and discard them. Shopping Mode sessions (R2) store only start, end and the merchants the user chose to open.
