-- Public read tests: only live, started, not-ended deals of active merchants are shown; feed paging and
-- filters; typo-tolerant search; deal and merchant pages; only the API may call the functions.
-- Run with `pnpm db:test` and in CI.
begin;
create extension if not exists pgtap with schema extensions;
select plan(23);

insert into public.merchants (id, slug, name, status) values
  ('00000000-0000-0000-0000-0000000000b1', 'scope-cinemas', 'Scope Cinemas', 'active'),
  ('00000000-0000-0000-0000-0000000000b2', 'hidden-shop', 'Hidden Shop', 'hidden');
insert into public.merchant_branches (merchant_id, name, city) values
  ('00000000-0000-0000-0000-0000000000b1', 'Colombo City Centre', 'Colombo');

insert into public.deals (id, merchant_id, slug, title, deal_type, discount_percent, status, starts_at, ends_at, category_id) values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000b1', 'movie-tuesday', 'Half price movie tickets', 'percent_off', 50, 'live',
    now() - interval '2 days', now() + interval '10 days', (select id from public.categories where slug = 'entertainment')),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000b1', 'popcorn-deal', 'Free popcorn with a large drink', 'freebie', null, 'live',
    now() - interval '1 day', null, (select id from public.categories where slug = 'restaurants')),
  ('00000000-0000-0000-0000-0000000000d3', '00000000-0000-0000-0000-0000000000b1', 'draft-deal', 'Draft deal', 'other', null, 'draft',
    now() - interval '1 day', null, null),
  ('00000000-0000-0000-0000-0000000000d4', '00000000-0000-0000-0000-0000000000b1', 'future-deal', 'Starts next week', 'other', null, 'live',
    now() + interval '7 days', null, null),
  ('00000000-0000-0000-0000-0000000000d5', '00000000-0000-0000-0000-0000000000b1', 'ended-deal', 'Ended but not yet expired', 'other', null, 'live',
    now() - interval '10 days', now() - interval '1 minute', null),
  ('00000000-0000-0000-0000-0000000000d6', '00000000-0000-0000-0000-0000000000b2', 'hidden-merchant-deal', 'From a hidden merchant', 'other', null, 'live',
    now() - interval '1 day', null, null);
insert into public.deal_schedules (deal_id, days_of_week) values ('00000000-0000-0000-0000-0000000000d1', '{2}');
insert into public.deal_eligibility (deal_id, provider_id)
select '00000000-0000-0000-0000-0000000000d1', id from public.providers where slug = 'hnb';
insert into public.coupon_codes (deal_id, code) values ('00000000-0000-0000-0000-0000000000d1', 'MOVIE50');

select results_eq(
  $$ select card ->> 'slug' from public.public_feed() $$,
  $$ values ('popcorn-deal'), ('movie-tuesday') $$,
  'the feed shows only public deals, newest first (no drafts, future, ended or hidden-merchant deals)'
);
select is(
  (select card -> 'validDays' from public.public_feed() where card ->> 'slug' = 'movie-tuesday'),
  '[2]'::jsonb, 'a card carries its valid days'
);
select is(
  (select card -> 'providers' from public.public_feed() where card ->> 'slug' = 'movie-tuesday'),
  '[{"slug": "hnb", "name": "Hatton National Bank (HNB)"}]'::jsonb, 'a card carries the banks whose cards qualify'
);
select is(
  (select card -> 'place' from public.public_feed() where card ->> 'slug' = 'movie-tuesday'),
  '{"city": "Colombo", "count": 1}'::jsonb, 'a card says where it works (all merchant branches when none are picked)'
);
select is(
  (select card ->> 'couponCode' from public.public_feed() where card ->> 'slug' = 'movie-tuesday'),
  'MOVIE50', 'a card carries its first copy coupon code'
);
select results_eq(
  $$ select card ->> 'slug' from public.public_feed(p_limit => 1) $$,
  $$ values ('popcorn-deal') $$,
  'the feed respects the page size'
);
select results_eq(
  $$ select card ->> 'slug' from public.public_feed(p_after_ts => (select starts_at from public.deals where slug = 'popcorn-deal'),
                                                    p_after_id => '00000000-0000-0000-0000-0000000000d2') $$,
  $$ values ('movie-tuesday') $$,
  'the next page starts after the given row'
);
select results_eq(
  $$ select card ->> 'slug' from public.public_feed(p_category_slug => 'food-dining') $$,
  $$ values ('popcorn-deal') $$,
  'a parent category includes deals from its sub-categories'
);
select results_eq(
  $$ select card ->> 'slug' from public.public_feed(p_merchant_slug => 'scope-cinemas', p_category_slug => 'entertainment') $$,
  $$ values ('movie-tuesday') $$,
  'merchant and category filters combine'
);

select is(
  (select merchant ->> 'slug' from public.public_search_merchants('scop cinemas') limit 1),
  'scope-cinemas', 'typo search "scop cinemas" finds Scope Cinemas'
);
select is(
  (select merchant ->> 'liveDeals' from public.public_search_merchants('scope') limit 1),
  '2', 'merchant results count only public deals'
);
select ok(
  (select count(*) = 2 from public.public_search_deals('scop cinemas')),
  'typo search on the merchant name finds its public deals'
);
select is(
  (select card ->> 'slug' from public.public_search_deals('movie tickets') limit 1),
  'movie-tuesday', 'word search finds the deal by its title'
);
select is((select count(*)::int from public.public_search_deals('draft deal')), 0, 'search never returns drafts');

select ok(
  (select d ->> 'title' = 'Half price movie tickets'
          and d -> 'coupons' = '[{"code": "MOVIE50", "kind": "copy"}]'::jsonb
          and d -> 'eligibility' -> 0 -> 'provider' ->> 'slug' = 'hnb'
          and (d ->> 'allBranches')::boolean
          and d -> 'branches' -> 0 ->> 'name' = 'Colombo City Centre'
   from public.public_deal('movie-tuesday') as d),
  'the deal page has coupons, eligible banks and branches (all branches when none are chosen)'
);
select ok(
  public.public_deal('draft-deal') is null and public.public_deal('ended-deal') is null,
  'draft and ended deals have no public page'
);
select ok(
  (public.public_merchant('scope-cinemas') ->> 'name') = 'Scope Cinemas' and public.public_merchant('hidden-shop') is null,
  'active merchants have a public page, hidden ones do not'
);
select ok(
  not has_function_privilege('anon', 'public.public_feed(text, text, timestamptz, uuid, int)', 'execute')
  and not has_function_privilege('authenticated', 'public.public_deal(text)', 'execute'),
  'apps cannot call the public read functions directly (only the API)'
);

-- Home page: valid today depends on the weekday; ending soon; counts.
select results_eq(
  $$ select jsonb_array_elements(public.public_home(2) -> 'today') ->> 'slug' $$,
  $$ values ('popcorn-deal'), ('movie-tuesday') $$,
  'on a Tuesday both deals are valid today (the Tuesday-only deal and the every-day deal)'
);
select results_eq(
  $$ select jsonb_array_elements(public.public_home(3) -> 'today') ->> 'slug' $$,
  $$ values ('popcorn-deal') $$,
  'on a Wednesday the Tuesday-only deal is not valid today'
);
select is(
  public.public_home(3) -> 'counts', '{"live": 2, "today": 1, "merchants": 1}'::jsonb,
  'home counts live deals, deals valid today and merchants with deals'
);
select ok(
  (select count(*) = 0 from jsonb_array_elements(public.public_home(2) -> 'ending')),
  'nothing ends within 7 days in this data'
);
select ok(
  (select s -> 'deals' @> '[{"slug": "movie-tuesday"}]' and not (s -> 'deals' @> '[{"slug": "draft-deal"}]')
          and s -> 'merchants' @> '[{"slug": "scope-cinemas"}]' and not (s -> 'merchants' @> '[{"slug": "hidden-shop"}]')
   from public.public_sitemap() as s),
  'the sitemap lists public deals and active merchants only'
);

select * from finish();
rollback;
