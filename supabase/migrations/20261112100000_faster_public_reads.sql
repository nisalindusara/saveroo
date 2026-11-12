-- Faster public lists: choose the page of deals first, then build cards for just those rows.
-- Before, Postgres built a card (days, banks, coupon) for every matching deal before sorting and
-- keeping one page (about 390 ms for a merchant feed with 2,000 deals).

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
  ),
  merchant as (
    select id from public.merchants where p_merchant_slug is not null and slug = p_merchant_slug
  ),
  page as (
    select d.id
    from public.deals d
    join public.merchants m on m.id = d.merchant_id
    where d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
      and m.status = 'active'
      and (p_category_slug is null or d.category_id in (select id from cats))
      and (p_merchant_slug is null or d.merchant_id = (select id from merchant))
      and (p_after_ts is null or (d.starts_at, d.id) < (p_after_ts, p_after_id))
    order by d.starts_at desc, d.id desc
    limit least(greatest(p_limit, 1), 51)
  )
  select public.deal_card(d, m), d.starts_at, d.id
  from page
  join public.deals d on d.id = page.id
  join public.merchants m on m.id = d.merchant_id
  order by d.starts_at desc, d.id desc;
$$;

create or replace function public.public_search_deals(p_q text, p_offset int default 0, p_limit int default 20)
returns table (card jsonb, score real)
language sql
stable
security definer
set search_path = extensions
as $$
  with q as (select websearch_to_tsquery('simple', p_q) as tsq, lower(p_q) as text),
  -- Merchants named like the query: few rows, so compare names once here, not once per deal.
  named as (
    select m.id, word_similarity(q.text, m.name) as ws
    from public.merchants m cross join q
    where m.status = 'active' and word_similarity(q.text, m.name) >= 0.5
  ),
  page as (
    select d.id,
      greatest(
        case when d.search @@ q.tsq then 1 + ts_rank(d.search, q.tsq) else 0 end,
        similarity(d.title, q.text),
        coalesce(named.ws, 0)
      )::real as score
    from public.deals d
    join public.merchants m on m.id = d.merchant_id
    cross join q
    left join named on named.id = d.merchant_id
    where d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
      and m.status = 'active'
      and (d.search @@ q.tsq or d.title % q.text or named.id is not null)
    order by score desc, d.id
    offset least(greatest(p_offset, 0), 200)
    limit least(greatest(p_limit, 1), 51)
  )
  select public.deal_card(d, m), page.score
  from page
  join public.deals d on d.id = page.id
  join public.merchants m on m.id = d.merchant_id
  order by page.score desc, d.id;
$$;
