-- Public read functions for the API: feed (all, by category or by merchant), search, deal and merchant
-- pages. Each returns ready-to-send JSON in one database call. A deal is public when it is live, has
-- started, has not ended and its merchant is active. Only the API (service role) may call these.

-- Feed order: newest first, by start time.
create index deals_live_feed_idx on public.deals (starts_at desc, id desc) where status = 'live';
create index deals_live_category_idx on public.deals (category_id, starts_at desc, id desc) where status = 'live';
create index deals_live_merchant_idx on public.deals (merchant_id, starts_at desc, id desc) where status = 'live';

-- Deal card: what a list shows for one deal.
create or replace function public.deal_card(p_deal public.deals, p_merchant public.merchants)
returns jsonb
language sql
stable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p_deal.id,
    'slug', p_deal.slug,
    'title', p_deal.title,
    'dealType', p_deal.deal_type,
    'discountPercent', p_deal.discount_percent,
    'discountAmountLkr', p_deal.discount_amount_lkr,
    'maxSavingLkr', p_deal.max_saving_lkr,
    'minSpendLkr', p_deal.min_spend_lkr,
    'originalPriceLkr', p_deal.original_price_lkr,
    'dealPriceLkr', p_deal.deal_price_lkr,
    'imageKey', p_deal.image_url,
    'channel', p_deal.channel,
    'startsAt', p_deal.starts_at,
    'endsAt', p_deal.ends_at,
    'isFeatured', p_deal.is_featured and (p_deal.featured_until is null or p_deal.featured_until > now()),
    'merchant', jsonb_build_object('slug', p_merchant.slug, 'name', p_merchant.name, 'logoKey', p_merchant.logo_url),
    -- Days the deal is valid on (1 = Mon .. 7 = Sun); empty means every day.
    'validDays', coalesce((
      select jsonb_agg(distinct dow order by dow)
      from public.deal_schedules s, unnest(s.days_of_week) as dow
      where s.deal_id = p_deal.id), '[]'::jsonb),
    -- Banks and providers whose cards qualify; empty means open to everyone.
    'providers', coalesce((
      select jsonb_agg(distinct p.name order by p.name)
      from public.deal_eligibility e join public.providers p on p.id = e.provider_id
      where e.deal_id = p_deal.id), '[]'::jsonb),
    'hasCoupon', exists (select 1 from public.coupon_codes c where c.deal_id = p_deal.id)
  );
$$;

-- Public deals, newest first, optionally for one category (and its sub-categories) or one merchant.
-- Keyset paging: pass the last row's sort_ts and sort_id to get the next page.
create or replace function public.public_feed(
  p_category_slug text default null,
  p_merchant_slug text default null,
  p_after_ts timestamptz default null,
  p_after_id uuid default null,
  p_limit int default 20)
returns table (card jsonb, sort_ts timestamptz, sort_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  with cats as (
    select c.id from public.categories c
    where p_category_slug is not null
      and (c.slug = p_category_slug
           or c.parent_id = (select id from public.categories where slug = p_category_slug))
  )
  select public.deal_card(d, m), d.starts_at, d.id
  from public.deals d
  join public.merchants m on m.id = d.merchant_id
  where d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
    and m.status = 'active'
    and (p_category_slug is null or d.category_id in (select id from cats))
    and (p_merchant_slug is null or m.slug = p_merchant_slug)
    and (p_after_ts is null or (d.starts_at, d.id) < (p_after_ts, p_after_id))
  order by d.starts_at desc, d.id desc
  limit least(greatest(p_limit, 1), 51);
$$;

-- Typo-tolerant search over public deals: words in title/description, similar titles, or a similar
-- merchant name ("scop cinemas" finds Scope Cinemas). Best matches first; offset paging (max 200).
create or replace function public.public_search_deals(p_q text, p_offset int default 0, p_limit int default 20)
returns table (card jsonb, score real)
language sql
stable
security definer
set search_path = extensions
as $$
  with q as (select websearch_to_tsquery('simple', p_q) as tsq, lower(p_q) as text)
  select public.deal_card(d, m),
    greatest(
      case when d.search @@ q.tsq then 1 + ts_rank(d.search, q.tsq) else 0 end,
      similarity(d.title, q.text),
      word_similarity(q.text, m.name)
    )::real as score
  from public.deals d
  join public.merchants m on m.id = d.merchant_id
  cross join q
  where d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
    and m.status = 'active'
    and (d.search @@ q.tsq or d.title % q.text or word_similarity(q.text, m.name) >= 0.5)
  order by score desc, d.id
  offset least(greatest(p_offset, 0), 200)
  limit least(greatest(p_limit, 1), 51);
$$;

-- Merchants whose name is like the query (for the top of search results).
create or replace function public.public_search_merchants(p_q text, p_limit int default 5)
returns table (merchant jsonb, score real)
language sql
stable
security definer
set search_path = extensions
as $$
  select jsonb_build_object('slug', m.slug, 'name', m.name, 'logoKey', m.logo_url,
           'liveDeals', (select count(*) from public.deals d where d.merchant_id = m.id and d.status = 'live'
                         and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now()))),
         greatest(similarity(m.name, p_q), word_similarity(lower(p_q), m.name))::real as score
  from public.merchants m
  where m.status = 'active'
    and (m.name % p_q or word_similarity(lower(p_q), m.name) >= 0.5 or m.name ilike '%' || p_q || '%')
  order by score desc, m.name
  limit least(greatest(p_limit, 1), 10);
$$;

-- Everything the deal page needs, or null when the deal is not public.
create or replace function public.public_deal(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.deal_card(d, m) || jsonb_build_object(
    'description', d.description,
    'terms', d.terms,
    'howToRedeem', d.how_to_redeem,
    'sourceUrl', d.source_url,
    'verification', d.verification,
    'lastCheckedAt', d.last_checked_at,
    'category', (select jsonb_build_object('slug', c.slug, 'name', c.name) from public.categories c where c.id = d.category_id),
    'merchant', jsonb_build_object('slug', m.slug, 'name', m.name, 'logoKey', m.logo_url,
                  'websiteUrl', m.website_url, 'isOnline', m.is_online),
    'schedules', coalesce((
      select jsonb_agg(jsonb_build_object(
        'daysOfWeek', s.days_of_week, 'startTime', to_char(s.start_time, 'HH24:MI'), 'endTime', to_char(s.end_time, 'HH24:MI'),
        'validFrom', s.valid_from, 'validTo', s.valid_to, 'blackoutDates', s.blackout_dates, 'note', s.note)
        order by s.created_at)
      from public.deal_schedules s where s.deal_id = d.id), '[]'::jsonb),
    'eligibility', coalesce((
      select jsonb_agg(jsonb_build_object(
        'provider', jsonb_build_object('slug', p.slug, 'name', p.name, 'type', p.type, 'logoKey', p.logo_url),
        'card', case when cp.id is null then null else jsonb_build_object('name', cp.name, 'cardType', cp.card_type, 'network', cp.network) end,
        'cardType', e.card_type, 'note', e.note) order by p.name, cp.name)
      from public.deal_eligibility e
      join public.providers p on p.id = e.provider_id
      left join public.card_products cp on cp.id = e.card_product_id
      where e.deal_id = d.id), '[]'::jsonb),
    'coupons', coalesce((
      select jsonb_agg(jsonb_build_object('code', c.code, 'kind', c.kind) order by c.code)
      from public.coupon_codes c where c.deal_id = d.id), '[]'::jsonb),
    -- No branch rows means every active branch of the merchant.
    'allBranches', not exists (select 1 from public.deal_branches db where db.deal_id = d.id),
    'branches', coalesce((
      select jsonb_agg(jsonb_build_object('name', b.name, 'address', b.address, 'city', b.city, 'district', b.district,
        'lat', extensions.st_y(b.location::extensions.geometry), 'lng', extensions.st_x(b.location::extensions.geometry))
        order by b.name)
      from public.merchant_branches b
      where b.merchant_id = m.id and b.status = 'active'
        and (not exists (select 1 from public.deal_branches db where db.deal_id = d.id)
             or exists (select 1 from public.deal_branches db where db.deal_id = d.id and db.branch_id = b.id))), '[]'::jsonb)
  )
  from public.deals d
  join public.merchants m on m.id = d.merchant_id
  where d.slug = p_slug
    and d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
    and m.status = 'active';
$$;

-- Merchant page header: details and active branches, or null when hidden. Deals come from public_feed.
create or replace function public.public_merchant(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'slug', m.slug, 'name', m.name, 'description', m.description, 'logoKey', m.logo_url, 'coverKey', m.cover_url,
    'websiteUrl', m.website_url, 'isOnline', m.is_online, 'hasPhysicalStores', m.has_physical_stores,
    'isVerified', m.is_verified,
    'category', (select jsonb_build_object('slug', c.slug, 'name', c.name) from public.categories c where c.id = m.primary_category_id),
    'branches', coalesce((
      select jsonb_agg(jsonb_build_object('name', b.name, 'address', b.address, 'city', b.city, 'district', b.district,
        'phone', b.phone, 'lat', extensions.st_y(b.location::extensions.geometry), 'lng', extensions.st_x(b.location::extensions.geometry))
        order by b.name)
      from public.merchant_branches b where b.merchant_id = m.id and b.status = 'active'), '[]'::jsonb)
  )
  from public.merchants m
  where m.slug = p_slug and m.status = 'active';
$$;

revoke execute on function public.deal_card(public.deals, public.merchants) from public, anon, authenticated;
revoke execute on function public.public_feed(text, text, timestamptz, uuid, int) from public, anon, authenticated;
revoke execute on function public.public_search_deals(text, int, int) from public, anon, authenticated;
revoke execute on function public.public_search_merchants(text, int) from public, anon, authenticated;
revoke execute on function public.public_deal(text) from public, anon, authenticated;
revoke execute on function public.public_merchant(text) from public, anon, authenticated;
grant execute on function public.deal_card(public.deals, public.merchants) to service_role;
grant execute on function public.public_feed(text, text, timestamptz, uuid, int) to service_role;
grant execute on function public.public_search_deals(text, int, int) to service_role;
grant execute on function public.public_search_merchants(text, int) to service_role;
grant execute on function public.public_deal(text) to service_role;
grant execute on function public.public_merchant(text) to service_role;
