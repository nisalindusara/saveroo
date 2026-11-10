-- Reference data: categories, brands, providers (banks, telcos, wallets) and their card products.
-- Readable by everyone; written only by the API (service key bypasses RLS).

create type public.provider_type as enum ('bank', 'telco', 'wallet', 'loyalty', 'network');
create type public.card_type as enum ('credit', 'debit', 'prepaid', 'loyalty', 'other');
create type public.card_network as enum ('visa', 'mastercard', 'amex', 'unionpay', 'local', 'none');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  name text not null,
  parent_id uuid references public.categories (id) on delete restrict,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index categories_parent_id_idx on public.categories (parent_id);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  name text not null,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.providers (
  id uuid primary key default gen_random_uuid(),
  slug public.slug not null unique,
  name text not null,
  type public.provider_type not null,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.card_products (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  name text not null,
  card_type public.card_type not null,
  network public.card_network not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider_id, name)
);

create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger brands_updated_at before update on public.brands
  for each row execute function public.set_updated_at();
create trigger providers_updated_at before update on public.providers
  for each row execute function public.set_updated_at();
create trigger card_products_updated_at before update on public.card_products
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.providers enable row level security;
alter table public.card_products enable row level security;

create policy "anyone can read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "anyone can read brands" on public.brands
  for select to anon, authenticated using (true);
create policy "anyone can read providers" on public.providers
  for select to anon, authenticated using (true);
create policy "anyone can read card products" on public.card_products
  for select to anon, authenticated using (true);
