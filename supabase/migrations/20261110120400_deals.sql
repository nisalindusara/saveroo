-- Deals and their details: branches, card eligibility, valid-day schedules and coupon codes.
-- Everyone can read live deals (and the details of live deals); writes go through the API.

create type public.deal_type as enum (
  'percent_off', 'amount_off', 'bogo', 'freebie', 'cashback',
  'coupon_code', 'price_drop', 'bundle', 'other'
);
create type public.deal_channel as enum ('in_store', 'online', 'both');
create type public.deal_status as enum ('draft', 'pending', 'live', 'paused', 'expired', 'rejected');
create type public.deal_verification as enum ('verified', 'community', 'unverified');
create type public.deal_origin as enum ('admin', 'community', 'merchant');
create type public.coupon_kind as enum ('copy', 'show_qr', 'auto_apply');

create table public.deals (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete restrict,
  slug public.slug not null unique,
  title text not null,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  brand_id uuid references public.brands (id) on delete set null,
  deal_type public.deal_type not null,
  discount_percent numeric(5, 2) check (discount_percent > 0 and discount_percent <= 100),
  discount_amount_lkr public.lkr,
  max_saving_lkr public.lkr,
  min_spend_lkr public.lkr,
  original_price_lkr public.lkr,
  deal_price_lkr public.lkr,
  terms text,
  how_to_redeem text,
  channel public.deal_channel not null default 'in_store',
  source_url text,
  proof_image_url text,
  affiliate_url text,
  status public.deal_status not null default 'draft',
  verification public.deal_verification not null default 'unverified',
  origin public.deal_origin not null default 'admin',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  last_checked_at timestamptz,
  recheck_due_at timestamptz,
  is_featured boolean not null default false,
  featured_until timestamptz,
  -- Set when the matching worker has processed this deal (M8).
  notified_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  view_count bigint not null default 0,
  -- Full-text search over title and description. 'simple' keeps words as typed (mixed-language text).
  search tsvector generated always as (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create index deals_status_ends_at_idx on public.deals (status, ends_at);
create index deals_merchant_id_idx on public.deals (merchant_id);
create index deals_category_id_status_idx on public.deals (category_id, status);
create index deals_brand_id_idx on public.deals (brand_id);
create index deals_created_by_idx on public.deals (created_by);
create index deals_recheck_due_at_idx on public.deals (recheck_due_at) where status = 'live';
create index deals_search_idx on public.deals using gin (search);
create index deals_title_trgm_idx on public.deals using gin (title extensions.gin_trgm_ops);

-- No rows for a deal means it is valid at all of the merchant's branches.
create table public.deal_branches (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  branch_id uuid not null references public.merchant_branches (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (deal_id, branch_id)
);
create index deal_branches_branch_id_idx on public.deal_branches (branch_id);

-- No rows for a deal means it is open to everyone.
-- card_product_id null means any card of that provider; card_type narrows it further.
create table public.deal_eligibility (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  provider_id uuid not null references public.providers (id) on delete restrict,
  card_product_id uuid references public.card_products (id) on delete restrict,
  card_type public.card_type,
  note text,
  created_at timestamptz not null default now()
);
create index deal_eligibility_deal_id_idx on public.deal_eligibility (deal_id);
create index deal_eligibility_provider_id_idx on public.deal_eligibility (provider_id);
create index deal_eligibility_card_product_id_idx on public.deal_eligibility (card_product_id);

-- No rows for a deal means every day between starts_at and ends_at.
-- days_of_week uses 1 = Monday to 7 = Sunday; times and dates are Asia/Colombo.
create table public.deal_schedules (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  days_of_week int[] not null default '{1,2,3,4,5,6,7}'
    check (days_of_week <@ '{1,2,3,4,5,6,7}' and cardinality(days_of_week) > 0),
  start_time time,
  end_time time,
  valid_from date,
  valid_to date,
  blackout_dates date[] not null default '{}',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
create index deal_schedules_deal_id_idx on public.deal_schedules (deal_id);

create table public.coupon_codes (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  code text not null,
  kind public.coupon_kind not null default 'copy',
  usage_limit int check (usage_limit > 0),
  used_count int not null default 0 check (used_count >= 0),
  valid_from timestamptz,
  valid_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (deal_id, code)
);

create trigger deals_updated_at before update on public.deals
  for each row execute function public.set_updated_at();
create trigger deal_schedules_updated_at before update on public.deal_schedules
  for each row execute function public.set_updated_at();
create trigger coupon_codes_updated_at before update on public.coupon_codes
  for each row execute function public.set_updated_at();

alter table public.deals enable row level security;
alter table public.deal_branches enable row level security;
alter table public.deal_eligibility enable row level security;
alter table public.deal_schedules enable row level security;
alter table public.coupon_codes enable row level security;

-- True when the deal is live and its merchant is active: the condition for public reads.
create or replace function public.is_public_deal(p_deal_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.deals d
    join public.merchants m on m.id = d.merchant_id
    where d.id = p_deal_id and d.status = 'live' and m.status = 'active'
  );
$$;

create policy "anyone can read live deals" on public.deals
  for select to anon, authenticated using (public.is_public_deal(id));
create policy "anyone can read branches of live deals" on public.deal_branches
  for select to anon, authenticated using (public.is_public_deal(deal_id));
create policy "anyone can read eligibility of live deals" on public.deal_eligibility
  for select to anon, authenticated using (public.is_public_deal(deal_id));
create policy "anyone can read schedules of live deals" on public.deal_schedules
  for select to anon, authenticated using (public.is_public_deal(deal_id));
create policy "anyone can read coupons of live deals" on public.coupon_codes
  for select to anon, authenticated using (public.is_public_deal(deal_id));
