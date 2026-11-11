-- Sign-up tests: a new auth user gets a profile (role user) and default notification settings.
-- Run with `pnpm db:test` and in CI.
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-0000000000e1', 'email@test.saveroo', '{}'),
  ('00000000-0000-0000-0000-0000000000f1', 'google@test.saveroo',
   '{"full_name": "Nimal Perera", "avatar_url": "https://example.com/a.png"}');

select is(
  (select role::text from public.profiles where id = '00000000-0000-0000-0000-0000000000e1'),
  'user',
  'a new user gets a profile with role user'
);
select ok(
  exists (select 1 from public.notification_preferences
          where user_id = '00000000-0000-0000-0000-0000000000e1'),
  'a new user gets default notification settings'
);
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-0000000000f1'),
  'Nimal Perera',
  'the name from Google is copied to the profile'
);
select is(
  (select avatar_url from public.profiles where id = '00000000-0000-0000-0000-0000000000f1'),
  'https://example.com/a.png',
  'the photo from Google is copied to the profile'
);
select ok(
  not has_function_privilege('authenticated', 'public.handle_new_user()', 'execute'),
  'signed-in users cannot call the sign-up function directly'
);

select * from finish();
rollback;
