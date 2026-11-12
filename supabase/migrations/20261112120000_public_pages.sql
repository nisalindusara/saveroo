-- Public web pages (M5): image shape for layout without jumps, JPEG share images for WhatsApp and
-- Facebook previews, bank codes on deal cards, one call for the home page, and the sitemap list.

-- Width divided by height of the deal image, so pages can reserve the right space before it loads.
-- Set by the admin uploader; null for images uploaded before M5 (they also have no share JPEG).
alter table public.deals add column image_ratio numeric(5, 3) check (image_ratio between 0.2 and 5);

-- Share previews (WhatsApp, Facebook) need JPEG: allow <key>-share.jpg next to the WebP sizes.
update storage.buckets set allowed_mime_types = array['image/webp', 'image/jpeg'] where id = 'media';

-- Deal card: adds imageRatio, and providers as {slug, name} so pages can show short codes ("HNB").
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
    'hasCoupon', exists (select 1 from public.coupon_codes c where c.deal_id = p_deal.id)
  );
$$;

-- Home page in one call: deals valid on the given weekday (1 = Mon .. 7 = Sun, Colombo), deals
-- ending within 7 days, and counts. Cards are built only for the rows returned.
create or replace function public.public_home(p_dow int, p_limit int default 12)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with visible as (
    select d.id, d.starts_at, d.ends_at, d.is_featured,
      not exists (select 1 from public.deal_schedules s where s.deal_id = d.id)
        or exists (select 1 from public.deal_schedules s where s.deal_id = d.id and p_dow = any (s.days_of_week)) as valid_today
    from public.deals d
    join public.merchants m on m.id = d.merchant_id
    where d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
      and m.status = 'active'
  ),
  today as (
    select id from visible where valid_today
    order by is_featured desc, starts_at desc, id desc
    limit least(greatest(p_limit, 1), 30)
  ),
  ending as (
    select id from visible where ends_at <= now() + interval '7 days'
    order by ends_at, id
    limit least(greatest(p_limit, 1), 30)
  ),
  cards as (
    select d.id, public.deal_card(d, m) as card
    from public.deals d join public.merchants m on m.id = d.merchant_id
    where d.id in (select id from today union select id from ending)
  )
  select jsonb_build_object(
    'today', coalesce((select jsonb_agg(c.card order by v.is_featured desc, v.starts_at desc, v.id desc)
                       from today t join cards c on c.id = t.id join visible v on v.id = t.id), '[]'::jsonb),
    'ending', coalesce((select jsonb_agg(c.card order by v.ends_at, v.id)
                        from ending e join cards c on c.id = e.id join visible v on v.id = e.id), '[]'::jsonb),
    'counts', jsonb_build_object(
      'live', (select count(*) from visible),
      'today', (select count(*) from visible where valid_today),
      'merchants', (select count(distinct d.merchant_id) from public.deals d where d.id in (select id from visible)))
  );
$$;

-- Everything public, for sitemap.xml: deals, merchants and categories with their last change.
create or replace function public.public_sitemap()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'deals', coalesce((
      select jsonb_agg(jsonb_build_object('slug', d.slug, 'updatedAt', d.updated_at) order by d.updated_at desc)
      from public.deals d join public.merchants m on m.id = d.merchant_id
      where d.status = 'live' and d.starts_at <= now() and (d.ends_at is null or d.ends_at > now())
        and m.status = 'active'), '[]'::jsonb),
    'merchants', coalesce((
      select jsonb_agg(jsonb_build_object('slug', m.slug, 'updatedAt', m.updated_at) order by m.name)
      from public.merchants m where m.status = 'active'), '[]'::jsonb),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('slug', c.slug, 'updatedAt', c.updated_at) order by c.sort_order)
      from public.categories c), '[]'::jsonb)
  );
$$;

-- Admin saves now also store the image shape (same function as in admin_tools, plus image_ratio).
create or replace function public.admin_save_deal(
  p_actor uuid, p_deal jsonb, p_branch_ids uuid[], p_eligibility jsonb, p_schedules jsonb, p_coupons jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (p_deal ->> 'id')::uuid;
  v_before jsonb;
  v_merchant uuid;
begin
  if v_id is null then
    insert into public.deals (
      merchant_id, slug, title, description, category_id, brand_id, deal_type, discount_percent,
      discount_amount_lkr, max_saving_lkr, min_spend_lkr, original_price_lkr, deal_price_lkr, terms,
      how_to_redeem, channel, source_url, proof_image_url, image_url, image_ratio, affiliate_url, verification,
      starts_at, ends_at, is_featured, featured_until, created_by, origin, status)
    select r.merchant_id, coalesce(r.slug, public.make_slug(r.title, 'deals')), r.title, r.description, r.category_id, r.brand_id, r.deal_type,
      r.discount_percent, r.discount_amount_lkr, r.max_saving_lkr, r.min_spend_lkr, r.original_price_lkr,
      r.deal_price_lkr, r.terms, r.how_to_redeem, coalesce(r.channel, 'in_store'), r.source_url,
      r.proof_image_url, r.image_url, r.image_ratio, r.affiliate_url, coalesce(r.verification, 'unverified'),
      coalesce(r.starts_at, now()), r.ends_at, coalesce(r.is_featured, false), r.featured_until,
      p_actor, 'admin', 'draft'
    from jsonb_populate_record(null::public.deals, p_deal) r
    returning id, merchant_id into v_id, v_merchant;
  else
    v_before := public.deal_snapshot(v_id);
    if v_before is null then
      raise exception 'deal_not_found' using errcode = 'P0002';
    end if;
    update public.deals d set
      merchant_id = r.merchant_id, slug = coalesce(r.slug, d.slug), title = r.title, description = r.description,
      category_id = r.category_id, brand_id = r.brand_id, deal_type = r.deal_type,
      discount_percent = r.discount_percent, discount_amount_lkr = r.discount_amount_lkr,
      max_saving_lkr = r.max_saving_lkr, min_spend_lkr = r.min_spend_lkr,
      original_price_lkr = r.original_price_lkr, deal_price_lkr = r.deal_price_lkr, terms = r.terms,
      how_to_redeem = r.how_to_redeem, channel = coalesce(r.channel, 'in_store'),
      source_url = r.source_url, proof_image_url = r.proof_image_url, image_url = r.image_url,
      image_ratio = r.image_ratio,
      affiliate_url = r.affiliate_url, verification = coalesce(r.verification, 'unverified'),
      starts_at = coalesce(r.starts_at, d.starts_at), ends_at = r.ends_at,
      is_featured = coalesce(r.is_featured, false), featured_until = r.featured_until
    from jsonb_populate_record(null::public.deals, p_deal) r
    where d.id = v_id
    returning d.merchant_id into v_merchant;
  end if;

  -- Branches must belong to the deal's merchant.
  delete from public.deal_branches where deal_id = v_id;
  insert into public.deal_branches (deal_id, branch_id)
  select v_id, b.id from public.merchant_branches b
  where b.id = any (coalesce(p_branch_ids, '{}')) and b.merchant_id = v_merchant;
  if (select count(*) from public.deal_branches where deal_id = v_id)
     <> cardinality(array(select distinct unnest(coalesce(p_branch_ids, '{}')))) then
    raise exception 'branch_not_of_merchant' using errcode = '22023';
  end if;

  -- A specific card must belong to the chosen provider.
  delete from public.deal_eligibility where deal_id = v_id;
  insert into public.deal_eligibility (deal_id, provider_id, card_product_id, card_type, note)
  select v_id, (e ->> 'provider_id')::uuid, (e ->> 'card_product_id')::uuid,
         (e ->> 'card_type')::public.card_type, e ->> 'note'
  from jsonb_array_elements(coalesce(p_eligibility, '[]')) e;
  if exists (
    select 1 from public.deal_eligibility e
    join public.card_products c on c.id = e.card_product_id
    where e.deal_id = v_id and c.provider_id <> e.provider_id
  ) then
    raise exception 'card_not_of_provider' using errcode = '22023';
  end if;

  delete from public.deal_schedules where deal_id = v_id;
  insert into public.deal_schedules (
    deal_id, days_of_week, start_time, end_time, valid_from, valid_to, blackout_dates, note)
  select v_id,
    array(select jsonb_array_elements_text(s -> 'days_of_week')::int),
    (s ->> 'start_time')::time, (s ->> 'end_time')::time,
    (s ->> 'valid_from')::date, (s ->> 'valid_to')::date,
    array(select jsonb_array_elements_text(coalesce(s -> 'blackout_dates', '[]'))::date),
    s ->> 'note'
  from jsonb_array_elements(coalesce(p_schedules, '[]')) s;

  delete from public.coupon_codes where deal_id = v_id;
  insert into public.coupon_codes (deal_id, code, kind, usage_limit, valid_from, valid_to)
  select v_id, c ->> 'code', coalesce((c ->> 'kind')::public.coupon_kind, 'copy'),
         (c ->> 'usage_limit')::int, (c ->> 'valid_from')::timestamptz, (c ->> 'valid_to')::timestamptz
  from jsonb_array_elements(coalesce(p_coupons, '[]')) c;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_actor, case when v_before is null then 'create' else 'update' end, 'deal', v_id,
          jsonb_build_object('before', v_before, 'after', public.deal_snapshot(v_id)));
  return v_id;
end;
$$;

revoke execute on function public.public_home(int, int) from public, anon, authenticated;
revoke execute on function public.public_sitemap() from public, anon, authenticated;
grant execute on function public.public_home(int, int) to service_role;
grant execute on function public.public_sitemap() to service_role;
