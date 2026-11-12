-- Deal cards also say where the deal works and show its coupon code, so a card answers
-- "where?" and "how?" without opening it (M5 design round). Adds to deal_card:
--   place: {city, count}: the first branch's city and how many branches the deal works at
--          (its own branches, or every active branch of the merchant when none are picked);
--          null when there are no branches (online-only shops).
--   couponCode: the first copy-type coupon code, or null.
create or replace function public.deal_card(p_deal public.deals, p_merchant public.merchants)
returns jsonb
language sql
stable
set search_path = ''
as $$
  with branches as (
    select b.name, b.city
    from public.merchant_branches b
    where b.merchant_id = p_merchant.id and b.status = 'active'
      and (not exists (select 1 from public.deal_branches db where db.deal_id = p_deal.id)
           or b.id in (select db.branch_id from public.deal_branches db where db.deal_id = p_deal.id))
  )
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
    'imageRatio', p_deal.image_ratio,
    'channel', p_deal.channel,
    'startsAt', p_deal.starts_at,
    'endsAt', p_deal.ends_at,
    'isFeatured', p_deal.is_featured and (p_deal.featured_until is null or p_deal.featured_until > now()),
    'merchant', jsonb_build_object('slug', p_merchant.slug, 'name', p_merchant.name, 'logoKey', p_merchant.logo_url),
    'validDays', coalesce((
      select jsonb_agg(distinct dow order by dow)
      from public.deal_schedules s, unnest(s.days_of_week) as dow
      where s.deal_id = p_deal.id), '[]'::jsonb),
    'providers', coalesce((
      select jsonb_agg(jsonb_build_object('slug', p.slug, 'name', p.name) order by p.name)
      from (select distinct p.slug, p.name
            from public.deal_eligibility e join public.providers p on p.id = e.provider_id
            where e.deal_id = p_deal.id) p), '[]'::jsonb),
    'hasCoupon', exists (select 1 from public.coupon_codes c where c.deal_id = p_deal.id),
    'couponCode', (select c.code from public.coupon_codes c
                   where c.deal_id = p_deal.id and c.kind = 'copy' order by c.created_at, c.code limit 1),
    'place', (select case when count(*) > 0 then jsonb_build_object(
                'city', (select coalesce(b.city, b.name) from branches b order by b.city nulls last, b.name limit 1),
                'count', count(*)) end
              from branches)
  );
$$;
