-- Per-user data: wallet (cards owned), follows, saved deals, reminders, notifications,
-- notification settings, push tokens, consents and store requests.
-- Each user can only see and change their own rows; API-only tables have no client policies.

create type public.follow_target as enum ('merchant', 'brand', 'category', 'keyword', 'product');
create type public.reminder_kind as enum ('valid_day', 'expiry');
create type public.notification_type as enum ('new_deal', 'reminder', 'expiring', 'system');
create type public.notification_channel as enum ('inapp', 'push', 'email', 'whatsapp');
create type public.delivery_status as enum ('queued', 'sent', 'failed', 'skipped');
create type public.digest_frequency as enum ('instant', 'daily', 'weekly');
create type public.app_platform as enum ('web', 'android', 'ios', 'extension');
create type public.consent_kind as enum ('notifications', 'location', 'analytics', 'marketing');

-- Cards and memberships the user owns. card_product_id null means "some card from this provider".
create table public.user_wallet (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete cascade,
  card_product_id uuid references public.card_products (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique nulls not distinct (user_id, provider_id, card_product_id)
);
create index user_wallet_provider_id_idx on public.user_wallet (provider_id);
create index user_wallet_card_product_id_idx on public.user_wallet (card_product_id);

-- keyword is set only for keyword follows; target_id is set for every other kind.
create table public.follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type public.follow_target not null,
  target_id uuid,
  keyword text,
  created_at timestamptz not null default now(),
  check (
    (target_type = 'keyword' and keyword is not null and target_id is null)
    or (target_type <> 'keyword' and target_id is not null and keyword is null)
  ),
  unique nulls not distinct (user_id, target_type, target_id, keyword)
);
create index follows_target_idx on public.follows (target_type, target_id);

create table public.saved_deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  remind_before_expiry boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, deal_id)
);
create index saved_deals_deal_id_idx on public.saved_deals (deal_id);

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  deal_id uuid not null references public.deals (id) on delete cascade,
  kind public.reminder_kind not null,
  remind_at timestamptz not null,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, deal_id, kind, remind_at)
);
create index reminders_due_idx on public.reminders (remind_at) where sent_at is null;
create index reminders_deal_id_idx on public.reminders (deal_id);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  deal_id uuid references public.deals (id) on delete set null,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_user_id_created_at_idx on public.notifications (user_id, created_at desc);
create index notifications_deal_id_idx on public.notifications (deal_id);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications (id) on delete cascade,
  channel public.notification_channel not null,
  status public.delivery_status not null default 'queued',
  sent_at timestamptz,
  error text,
  created_at timestamptz not null default now()
);
create index notification_deliveries_notification_id_idx on public.notification_deliveries (notification_id);

create table public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  push boolean not null default true,
  email boolean not null default true,
  inapp boolean not null default true,
  -- Quiet hours in Asia/Colombo time; null means none.
  quiet_start time,
  quiet_end time,
  daily_cap int not null default 5 check (daily_cap between 0 and 50),
  digest public.digest_frequency not null default 'instant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  token text not null unique,
  platform public.app_platform not null check (platform <> 'extension'),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index push_tokens_user_id_idx on public.push_tokens (user_id);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.consent_kind not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, kind)
);

-- Demand signal: stores people asked for that Saveroo does not list yet. Written by the API.
create table public.store_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  url_or_domain text not null,
  created_at timestamptz not null default now()
);
create index store_requests_user_id_idx on public.store_requests (user_id);

create trigger notification_preferences_updated_at before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.user_wallet enable row level security;
alter table public.follows enable row level security;
alter table public.saved_deals enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_deliveries enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_tokens enable row level security;
alter table public.consents enable row level security;
alter table public.store_requests enable row level security;

-- Own-rows access: read, add, change and remove only rows where user_id is the signed-in user.
create policy "users manage own wallet" on public.user_wallet
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users manage own follows" on public.follows
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users manage own saved deals" on public.saved_deals
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users manage own reminders" on public.reminders
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users manage own notification preferences" on public.notification_preferences
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users manage own push tokens" on public.push_tokens
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users manage own consents" on public.consents
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Notifications are created by the API; users can read them, mark them read and delete them.
create policy "users read own notifications" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "users mark own notifications read" on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users delete own notifications" on public.notifications
  for delete to authenticated using (user_id = (select auth.uid()));
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

-- notification_deliveries and store_requests: API only (no client policies).
