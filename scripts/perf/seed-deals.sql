-- Performance test data: 60 merchants and 2,000 deals (about 85% live) with schedules, eligible banks
-- and coupons. LOCAL DATABASE ONLY: run after `pnpm db:reset`, see scripts/perf/README.md.
-- Merchant slugs start with "perf-" so the data is easy to recognise.

insert into public.merchants (slug, name, primary_category_id, is_online)
select 'perf-' || lower(regexp_replace(n, '[^a-zA-Z0-9]+', '-', 'g')), n,
       (select id from public.categories where parent_id is null order by random() limit 1), random() < 0.3
from unnest(array[
  'Scope Cinemas', 'Keells Super', 'Cargills Food City', 'Arpico Supercentre', 'Glomark', 'Laugfs Super',
  'Odel', 'House of Fashions', 'Cool Planet', 'Fashion Bug', 'Nolimit', 'Spring and Summer',
  'Abans', 'Singer', 'Softlogic', 'Damro', 'Singhagiri', 'Dialog Shop',
  'Pizza Hut', 'KFC', 'Burger King', 'Domino''s Pizza', 'Java Lounge', 'Barista', 'Perera and Sons',
  'Green Cabin', 'Ministry of Crab', 'Nihonbashi', 'Kaema Sutra', 'Paradise Road Cafe',
  'Cinnamon Grand', 'Shangri-La Colombo', 'Jetwing Hotels', 'Heritance Kandalama', 'Amaya Resorts',
  'Daraz', 'Kapruka', 'Wasi.lk', 'Takas.lk', 'MyDeal.lk',
  'Healthguard', 'Osu Sala', 'Spa Ceylon', 'Siddhalepa', 'Janet',
  'Vogue Jewellers', 'Swarnamahal', 'Raja Jewellers', 'Mallika Hemachandra', 'Hemachandra',
  'Sarasavi Bookshop', 'Vijitha Yapa', 'Expographic Books', 'Toys R Fun', 'Kids Planet',
  'Ceypetco Fuel', 'Lanka IOC', 'PickMe', 'Uber Eats', 'Hutch Shop'
]) as n;

insert into public.deals (
  merchant_id, slug, title, description, category_id, deal_type, discount_percent, discount_amount_lkr,
  max_saving_lkr, min_spend_lkr, status, starts_at, ends_at, is_featured, last_checked_at, recheck_due_at)
select m.id,
       'perf-deal-' || g,
       (array['Up to', 'Flat', 'Save', 'Get', 'Enjoy'])[1 + g % 5] || ' ' || (5 + g % 46) || '% off '
         || (array['groceries', 'movie tickets', 'dining', 'fashion', 'electronics', 'hotel stays', 'online orders',
                   'pizza', 'jewellery', 'books'])[1 + g % 10]
         || ' with ' || (array['HNB', 'Sampath', 'Commercial Bank', 'NTB', 'BOC', 'Seylan'])[1 + g % 6] || ' cards',
       'Offer ' || g || ' at ' || m.name || '. Terms apply.',
       (select id from public.categories order by random() limit 1),
       case when g % 7 = 0 then 'amount_off'::public.deal_type else 'percent_off' end,
       case when g % 7 = 0 then null else 5 + g % 46 end,
       case when g % 7 = 0 then 250 * (1 + g % 20) else null end,
       case when g % 3 = 0 then 500 * (1 + g % 10) else null end,
       case when g % 4 = 0 then 1000 * (1 + g % 10) else null end,
       (case when g % 20 = 0 then 'draft' when g % 33 = 0 then 'expired' else 'live' end)::public.deal_status,
       now() - (g % 60) * interval '1 day' - (g % 24) * interval '1 hour',
       case when g % 5 = 0 then null else now() + (1 + g % 90) * interval '1 day' end,
       g % 50 = 0, now() - interval '3 days', now() + (g % 20 - 3) * interval '1 day'
from generate_series(1, 2000) as g
join lateral (select id, name from public.merchants where slug like 'perf-%' order by md5(g::text || slug) limit 1) m on true;

-- About half the deals are valid on certain days only.
insert into public.deal_schedules (deal_id, days_of_week)
select d.id, case when n % 3 = 0 then '{6,7}'::int[] when n % 3 = 1 then array[1 + n % 7] else '{2,4}'::int[] end
from (select id, row_number() over (order by id) as n from public.deals where slug like 'perf-deal-%') d
where n % 2 = 0;

-- Most deals need a card from one to three banks.
insert into public.deal_eligibility (deal_id, provider_id, card_type)
select d.id, p.id, case when d.n % 2 = 0 then 'credit'::public.card_type end
from (select id, row_number() over (order by id) as n from public.deals where slug like 'perf-deal-%') d
join lateral (
  select id from public.providers where type = 'bank' order by md5(d.n::text || slug) limit (d.n % 4)
) p on true;

insert into public.coupon_codes (deal_id, code)
select id, 'SAVE' || right(slug, 4) from public.deals where slug like 'perf-deal-%' and right(slug, 1) in ('3', '7');

select (select count(*) from public.deals where slug like 'perf-deal-%') as deals,
       (select count(*) from public.deals where slug like 'perf-deal-%' and status = 'live') as live,
       (select count(*) from public.merchants where slug like 'perf-%') as merchants;
