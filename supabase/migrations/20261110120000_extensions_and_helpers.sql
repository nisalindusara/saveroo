-- Extensions and shared helpers used by every later migration.
-- pg_trgm: typo-tolerant search. postgis: branch locations. set_updated_at(): keeps updated_at current.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists postgis with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Slugs are lowercase words joined by single hyphens, e.g. "keells-super".
create domain public.slug as text
  check (value ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(value) <= 120);

-- LKR amounts: numeric(12,2), never negative.
create domain public.lkr as numeric(12, 2)
  check (value >= 0);
