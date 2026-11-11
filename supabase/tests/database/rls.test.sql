-- Row Level Security tests: who can read and change what.
-- Run with `pnpm db:test` (locally, needs Docker) and in CI on every push.
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

-- Every table in the public schema must have RLS switched on.
select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'every public table has row level security enabled'
);

-- Two users, A and B, each with one card in their wallet.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'a@test.saveroo'),
  ('00000000-0000-0000-0000-00000000000b', 'b@test.saveroo');
insert into public.profiles (id, display_name) values
  ('00000000-0000-0000-0000-00000000000a', 'User A'),
  ('00000000-0000-0000-0000-00000000000b', 'User B');
insert into public.user_wallet (user_id, provider_id)
select u.id, p.id
from (values ('00000000-0000-0000-0000-00000000000a'::uuid),
             ('00000000-0000-0000-0000-00000000000b'::uuid)) as u (id)
cross join public.providers p
where p.slug = 'commercial-bank';

-- A merchant with one live deal and one draft deal.
insert into public.merchants (id, slug, name) values
  ('00000000-0000-0000-0000-0000000000c1', 'test-merchant', 'Test Merchant');
insert into public.deals (merchant_id, slug, title, deal_type, status) values
  ('00000000-0000-0000-0000-0000000000c1', 'test-live-deal', 'Live deal', 'percent_off', 'live'),
  ('00000000-0000-0000-0000-0000000000c1', 'test-draft-deal', 'Draft deal', 'percent_off', 'draft');

-- Act as user A.
set local role authenticated;
select set_config('request.jwt.claims',
  '{"sub": "00000000-0000-0000-0000-00000000000a", "role": "authenticated"}', true);

select is(
  (select count(*)::int from public.user_wallet),
  1,
  'user A sees exactly one wallet row'
);
select is(
  (select count(*)::int from public.user_wallet
   where user_id = '00000000-0000-0000-0000-00000000000b'),
  0,
  'user A cannot read user B''s wallet'
);
select throws_ok(
  $$ insert into public.user_wallet (user_id, provider_id)
     select '00000000-0000-0000-0000-00000000000b', id from public.providers where slug = 'hnb' $$,
  '42501',
  null,
  'user A cannot add a card to user B''s wallet'
);
-- Silently matches no rows under RLS; checked as the database owner further down.
delete from public.user_wallet where user_id = '00000000-0000-0000-0000-00000000000b';
select lives_ok(
  $$ insert into public.user_wallet (user_id, provider_id)
     select '00000000-0000-0000-0000-00000000000a', id from public.providers where slug = 'hnb' $$,
  'user A can add a card to their own wallet'
);
select is(
  (select count(*)::int from public.profiles),
  1,
  'user A sees only their own profile'
);
select lives_ok(
  $$ update public.profiles set display_name = 'Renamed'
     where id = '00000000-0000-0000-0000-00000000000a' $$,
  'user A can rename themselves'
);
select throws_ok(
  $$ update public.profiles set role = 'admin'
     where id = '00000000-0000-0000-0000-00000000000a' $$,
  '42501',
  null,
  'user A cannot make themselves admin'
);
select throws_ok(
  $$ insert into public.events (name, platform) values ('view', 'web') $$,
  '42501',
  null,
  'users cannot write events directly (API only)'
);

reset role;
select is(
  (select count(*)::int from public.user_wallet
   where user_id = '00000000-0000-0000-0000-00000000000b'),
  1,
  'user A''s delete did not remove user B''s wallet row'
);

-- Act as a visitor who is not signed in.
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select is(
  (select count(*)::int from public.user_wallet),
  0,
  'visitors cannot read any wallet'
);
select ok(
  (select count(*) from public.categories) > 0,
  'visitors can read categories'
);
select results_eq(
  $$ select slug::text from public.deals where merchant_id = '00000000-0000-0000-0000-0000000000c1' $$,
  $$ values ('test-live-deal') $$,
  'visitors see live deals but not drafts'
);
select is(
  (select count(*)::int from public.profiles),
  0,
  'visitors cannot read profiles'
);

select * from finish();
rollback;
