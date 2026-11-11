-- One profile per signed-in user (id = auth user id), holding role and preferences.
-- Users read and edit only their own profile, and never their role or points.

create type public.user_role as enum ('user', 'moderator', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  district text,
  language text not null default 'en' check (language in ('en', 'si', 'ta')),
  role public.user_role not null default 'user',
  onboarding_done boolean not null default false,
  points int not null default 0 check (points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "users read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

create policy "users update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Column-level guard: users may only change these columns (not role, points or id).
revoke update on public.profiles from anon, authenticated;
grant update (display_name, avatar_url, district, language, onboarding_done)
  on public.profiles to authenticated;
