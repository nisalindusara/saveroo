-- Several photos per deal (up to 10), 2026-11-15. deal_images holds them in order; the first one is the
-- cover and is copied to deals.image_url / image_ratio, so deal cards, share previews and the feed are
-- unchanged. Existing deal images are moved in as the first photo. admin_save_deal replaces the photos
-- when it gets "images" in p_deal; deal_snapshot (audit log) and public_deal include them.

create table public.deal_images (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null references public.deals (id) on delete cascade,
  -- Image key in the media bucket (sizes -320/-640/-1280.webp, and -share.jpg).
  image_url text not null,
  image_ratio numeric(5,3) check (image_ratio between 0.2 and 5),
  sort_order int not null default 0 check (sort_order between 0 and 9),
  created_at timestamptz not null default now(),
  unique (deal_id, sort_order)
);
create index deal_images_deal_id_idx on public.deal_images (deal_id, sort_order);

alter table public.deal_images enable row level security;
create policy "anyone can read photos of live deals" on public.deal_images
  for select to anon, authenticated using (public.is_public_deal(deal_id));

insert into public.deal_images (deal_id, image_url, image_ratio, sort_order)
select id, image_url, image_ratio, 0 from public.deals where image_url is not null;

create or replace function public.deal_snapshot(p_deal_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(d) - 'search' - 'view_count' || jsonb_build_object(
    'branch_ids', coalesce((select jsonb_agg(b.branch_id order by b.branch_id)
                            from public.deal_branches b where b.deal_id = d.id), '[]'),
    'eligibility', coalesce((select jsonb_agg(to_jsonb(e) - 'id' - 'deal_id' - 'created_at' order by e.created_at, e.id)
                             from public.deal_eligibility e where e.deal_id = d.id), '[]'),
    'schedules', coalesce((select jsonb_agg(to_jsonb(s) - 'id' - 'deal_id' - 'created_at' - 'updated_at' order by s.created_at, s.id)
                           from public.deal_schedules s where s.deal_id = d.id), '[]'),
    'coupons', coalesce((select jsonb_agg(to_jsonb(c) - 'id' - 'deal_id' - 'created_at' - 'updated_at' order by c.code)
                         from public.coupon_codes c where c.deal_id = d.id), '[]'),
    'images', coalesce((select jsonb_agg(jsonb_build_object('image_url', i.image_url, 'image_ratio', i.image_ratio) order by i.sort_order)
                        from public.deal_images i where i.deal_id = d.id), '[]')
  )
  from public.deals d
  where d.id = p_deal_id;
$$;

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
    'images', coalesce((
      select jsonb_agg(jsonb_build_object('key', i.image_url, 'ratio', i.image_ratio) order by i.sort_order)
      from public.deal_images i where i.deal_id = d.id), '[]'::jsonb),
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

  -- Photos (up to 10): replaced when the caller sends "images"; the first is the cover (deals.image_url).
  if p_deal ? 'images' then
    if jsonb_array_length(coalesce(p_deal -> 'images', '[]')) > 10 then
      raise exception 'too_many_images' using errcode = '22023';
    end if;
    delete from public.deal_images where deal_id = v_id;
    insert into public.deal_images (deal_id, image_url, image_ratio, sort_order)
    select v_id, i ->> 'image_url', (i ->> 'image_ratio')::numeric(5,3), (o - 1)::int
    from jsonb_array_elements(p_deal -> 'images') with ordinality as x(i, o);
    update public.deals set
      image_url = (select image_url from public.deal_images where deal_id = v_id order by sort_order limit 1),
      image_ratio = (select image_ratio from public.deal_images where deal_id = v_id order by sort_order limit 1)
    where id = v_id;
  end if;

  delete from public.coupon_codes where deal_id = v_id;
  insert into public.coupon_codes (deal_id, code, kind, usage_limit, valid_from, valid_to, price_lkr)
  select v_id, c ->> 'code', coalesce((c ->> 'kind')::public.coupon_kind, 'copy'),
         (c ->> 'usage_limit')::int, (c ->> 'valid_from')::timestamptz, (c ->> 'valid_to')::timestamptz,
         (c ->> 'price_lkr')::numeric(12,2)
  from jsonb_array_elements(coalesce(p_coupons, '[]')) c;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_actor, case when v_before is null then 'create' else 'update' end, 'deal', v_id,
          jsonb_build_object('before', v_before, 'after', public.deal_snapshot(v_id)));
  return v_id;
end;
$$;
