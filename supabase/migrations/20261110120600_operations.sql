-- Operations tables: product events, admin audit log and feature flags.
-- API only: RLS is on with no client policies, so apps cannot read or write them directly.

create table public.events (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles (id) on delete set null,
  anonymous_id text,
  name text not null,
  entity_type text,
  entity_id uuid,
  props jsonb not null default '{}',
  platform public.app_platform not null,
  app_version text,
  created_at timestamptz not null default now()
);
create index events_name_created_at_idx on public.events (name, created_at);
create index events_user_id_idx on public.events (user_id);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  diff jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id, created_at desc);
create index audit_log_actor_id_idx on public.audit_log (actor_id);

create table public.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  enabled boolean not null default false,
  rollout_percent int not null default 100 check (rollout_percent between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger feature_flags_updated_at before update on public.feature_flags
  for each row execute function public.set_updated_at();

alter table public.events enable row level security;
alter table public.audit_log enable row level security;
alter table public.feature_flags enable row level security;
