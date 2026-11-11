-- Merchants and their physical branches.
-- Everyone can read active merchants and their active branches; writes go through the API.

create type public.merchant_status as enum ('active', 'hidden');

create table public.merchants (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  name text not null,
  description text,
  logo_url text,
  cover_url text,
  website_url text,
  -- Web domains that belong to this merchant, e.g. {daraz.lk}; used by share-to-Saveroo.
  domains text[] not null default '{}',
  phone text,
  primary_category_id uuid references public.categories (id) on delete set null,
  is_online boolean not null default false,
  has_physical_stores boolean not null default true,
  is_verified boolean not null default false,
  status public.merchant_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index merchants_primary_category_id_idx on public.merchants (primary_category_id);
create index merchants_domains_idx on public.merchants using gin (domains);
create index merchants_name_trgm_idx on public.merchants using gin (name extensions.gin_trgm_ops);

create table public.merchant_branches (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants (id) on delete cascade,
  name text not null,
  address text,
  city text,
  district text,
  location extensions.geography(point, 4326),
  opening_hours jsonb,
  phone text,
  status public.merchant_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index merchant_branches_merchant_id_idx on public.merchant_branches (merchant_id);
create index merchant_branches_location_idx on public.merchant_branches using gist (location);

create trigger merchants_updated_at before update on public.merchants
  for each row execute function public.set_updated_at();
create trigger merchant_branches_updated_at before update on public.merchant_branches
  for each row execute function public.set_updated_at();

alter table public.merchants enable row level security;
alter table public.merchant_branches enable row level security;

create policy "anyone can read active merchants" on public.merchants
  for select to anon, authenticated using (status = 'active');

create policy "anyone can read active branches of active merchants" on public.merchant_branches
  for select to anon, authenticated using (
    status = 'active'
    and exists (
      select 1 from public.merchants m
      where m.id = merchant_id and m.status = 'active'
    )
  );
