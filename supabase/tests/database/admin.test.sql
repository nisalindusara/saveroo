-- Admin tool tests: saving merchants and deals with their details, status changes, recheck,
-- automatic expiry, duplicate detection, audit log and who may call the functions.
-- Run with `pnpm db:test` and in CI.
begin;
create extension if not exists pgtap with schema extensions;
select plan(27);

-- An admin user (profile comes from the sign-up trigger).
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000ad', 'admin@test.saveroo');

-- Merchant with two branches.
create temp table t (key text primary key, id uuid) on commit drop;
insert into t values ('merchant', public.admin_save_merchant(
  '00000000-0000-0000-0000-0000000000ad',
  '{"slug": "test-cinema", "name": "Test Cinema", "domains": ["testcinema.lk"], "is_online": false}',
  '[{"name": "Colombo", "city": "Colombo", "lat": 6.9271, "lng": 79.8612},
    {"name": "Kandy", "city": "Kandy"}]'
));
select is((select count(*)::int from public.merchant_branches where merchant_id = (select id from t where key = 'merchant')),
  2, 'a merchant is created with its two branches');
select is((select round(extensions.st_y(location::extensions.geometry)::numeric, 4) from public.merchant_branches where name = 'Colombo'),
  6.9271, 'branch location is stored from lat and lng');
select is((select action from public.audit_log where entity_type = 'merchant' and entity_id = (select id from t where key = 'merchant')),
  'create', 'creating a merchant is written to the audit log');

-- Update: keep Colombo (by id), drop Kandy, add Galle.
select public.admin_save_merchant(
  '00000000-0000-0000-0000-0000000000ad',
  jsonb_build_object('id', (select id from t where key = 'merchant'), 'slug', 'test-cinema', 'name', 'Test Cinemas'),
  jsonb_build_array(
    jsonb_build_object('id', (select id from public.merchant_branches where name = 'Colombo'), 'name', 'Colombo City'),
    jsonb_build_object('name', 'Galle'))
);
select results_eq(
  $$ select name from public.merchant_branches where merchant_id = (select id from t where key = 'merchant') order by name $$,
  $$ values ('Colombo City'), ('Galle') $$,
  'updating a merchant keeps, renames, adds and removes branches'
);
select ok(
  (select diff -> 'before' ->> 'name' = 'Test Cinema' and diff -> 'after' ->> 'name' = 'Test Cinemas'
   from public.audit_log where entity_type = 'merchant' and action = 'update'),
  'the audit log keeps the merchant before and after'
);

-- Deal: Tuesday only, HNB any card, one coupon, one branch.
insert into t values ('deal', public.admin_save_deal(
  '00000000-0000-0000-0000-0000000000ad',
  jsonb_build_object('merchant_id', (select id from t where key = 'merchant'), 'slug', 'tuesday-movie-deal',
    'title', '50% off movie tickets on Tuesdays', 'deal_type', 'percent_off', 'discount_percent', 50,
    'ends_at', now() + interval '30 days'),
  array[(select id from public.merchant_branches where name = 'Galle')],
  jsonb_build_array(jsonb_build_object('provider_id', (select id from public.providers where slug = 'hnb'))),
  '[{"days_of_week": [2], "blackout_dates": ["2026-12-25"]}]',
  '[{"code": "MOVIE50", "kind": "copy"}]'
));
select is((select status::text from public.deals where id = (select id from t where key = 'deal')),
  'draft', 'a new deal starts as a draft');
select is((select created_by from public.deals where id = (select id from t where key = 'deal')),
  '00000000-0000-0000-0000-0000000000ad'::uuid, 'the deal records who created it');
select is((select days_of_week from public.deal_schedules where deal_id = (select id from t where key = 'deal')),
  array[2], 'the Tuesday-only schedule is saved');
select is((select blackout_dates from public.deal_schedules where deal_id = (select id from t where key = 'deal')),
  array['2026-12-25'::date], 'blackout dates are saved');
select is((select count(*)::int from public.deal_eligibility where deal_id = (select id from t where key = 'deal')),
  1, 'the eligible provider is saved');
select is((select code from public.coupon_codes where deal_id = (select id from t where key = 'deal')),
  'MOVIE50', 'the coupon code is saved');
select is((select count(*)::int from public.deal_branches where deal_id = (select id from t where key = 'deal')),
  1, 'the branch link is saved');

select throws_ok(
  format($$ select public.admin_save_deal(null, %L, array[gen_random_uuid()], '[]', '[]', '[]') $$,
    jsonb_build_object('merchant_id', (select id from t where key = 'merchant'), 'slug', 'bad-branch-deal',
      'title', 'Bad branch', 'deal_type', 'other')),
  '22023', 'branch_not_of_merchant', 'a branch from another merchant is refused'
);
select throws_ok(
  format($$ select public.admin_save_deal(null, %L, '{}', %L, '[]', '[]') $$,
    jsonb_build_object('merchant_id', (select id from t where key = 'merchant'), 'slug', 'bad-card-deal',
      'title', 'Bad card', 'deal_type', 'other'),
    jsonb_build_array(jsonb_build_object(
      'provider_id', (select id from public.providers where slug = 'hnb'),
      'card_product_id', (select c.id from public.card_products c join public.providers p on p.id = c.provider_id
                          where p.slug = 'sampath-bank' limit 1)))),
  '22023', 'card_not_of_provider', 'a card that does not belong to the provider is refused'
);

select is(
  (select title from public.admin_find_duplicate_deals((select id from t where key = 'merchant'), '50% off movie tickets Tuesday', null)),
  '50% off movie tickets on Tuesdays', 'a similar title at the same merchant is reported as a possible duplicate'
);

-- Publish: live, with a recheck date.
select public.admin_set_deal_status('00000000-0000-0000-0000-0000000000ad', (select id from t where key = 'deal'), 'live');
select ok(
  (select status = 'live' and recheck_due_at > now() + interval '13 days'
   from public.deals where id = (select id from t where key = 'deal')),
  'publishing makes the deal live and schedules a recheck in 14 days'
);
select ok(
  exists (select 1 from public.audit_log where entity_id = (select id from t where key = 'deal') and action = 'set_status'
          and diff -> 'status' ->> 'to' = 'live'),
  'publishing is written to the audit log'
);
select throws_ok(
  format($$ select public.admin_set_deal_status(null, %L, 'rejected') $$, (select id from t where key = 'deal')),
  '22023', 'invalid_status_change', 'a live deal cannot be rejected'
);

-- Recheck: overdue deals show up, marking checked moves the date on.
update public.deals set recheck_due_at = now() - interval '1 day' where id = (select id from t where key = 'deal');
select public.admin_mark_deal_checked('00000000-0000-0000-0000-0000000000ad', (select id from t where key = 'deal'));
select ok(
  (select recheck_due_at > now() + interval '13 days' and last_checked_at > now() - interval '1 minute'
   from public.deals where id = (select id from t where key = 'deal')),
  'marking a deal checked schedules the next recheck'
);

-- Expiry: a live deal whose end time has passed becomes expired.
update public.deals set starts_at = now() - interval '10 days', ends_at = now() - interval '1 minute'
where id = (select id from t where key = 'deal');
select is(public.expire_deals(), 1, 'expire_deals expires the ended deal');
select is((select status::text from public.deals where id = (select id from t where key = 'deal')),
  'expired', 'the ended deal is now expired');
select throws_ok(
  format($$ select public.admin_set_deal_status(null, %L, 'live') $$, (select id from t where key = 'deal')),
  '22023', 'invalid_status_change', 'an expired deal cannot be published again'
);

-- CSV import saves several deals in one call, and nothing if one of them is invalid.
select is(
  cardinality(public.admin_import_deals('00000000-0000-0000-0000-0000000000ad', jsonb_build_array(
    jsonb_build_object('deal', jsonb_build_object('merchant_id', (select id from t where key = 'merchant'),
      'slug', 'import-one', 'title', 'Imported one', 'deal_type', 'other')),
    jsonb_build_object('deal', jsonb_build_object('merchant_id', (select id from t where key = 'merchant'),
      'slug', 'import-two', 'title', 'Imported two', 'deal_type', 'other'),
      'schedules', '[{"days_of_week": [6, 7]}]'::jsonb)))),
  2, 'import saves two deals in one call'
);
select throws_ok(
  format($$ select public.admin_import_deals(null, %L) $$, jsonb_build_array(
    jsonb_build_object('deal', jsonb_build_object('merchant_id', (select id from t where key = 'merchant'),
      'slug', 'import-three', 'title', 'Imported three', 'deal_type', 'other')),
    jsonb_build_object('deal', jsonb_build_object('merchant_id', (select id from t where key = 'merchant'),
      'slug', 'import-one', 'title', 'Duplicate slug', 'deal_type', 'other')))),
  '23505', null, 'an import with a clashing slug fails'
);
select is((select count(*)::int from public.deals where slug = 'import-three'), 0,
  'a failed import saves none of its deals');

-- Only the API may call the admin functions.
select ok(
  not has_function_privilege('authenticated', 'public.admin_save_deal(uuid, jsonb, uuid[], jsonb, jsonb, jsonb)', 'execute')
  and not has_function_privilege('anon', 'public.admin_save_merchant(uuid, jsonb, jsonb)', 'execute')
  and not has_function_privilege('authenticated', 'public.expire_deals()', 'execute'),
  'signed-in users and visitors cannot call the admin functions'
);
select ok(
  (select public from storage.buckets where id = 'media'),
  'the public media bucket exists'
);

select * from finish();
rollback;
