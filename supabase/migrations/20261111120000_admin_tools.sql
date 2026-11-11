-- Admin tools: atomic save functions for merchants and deals (with audit log), deal status changes,
-- recheck, automatic expiry, duplicate detection, the deal image column and the public image bucket.
-- All functions run only for the API (service role); apps cannot call them.

-- Main deal image. Image columns hold an image key such as "deals/<id>/<random>";
-- files are stored as <key>-320.webp, <key>-640.webp and <key>-1280.webp in the "media" bucket.
alter table public.deals add column image_url text;

-- Public bucket for images: anyone can view, only the API (service role) can upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 1048576, array['image/webp'])
on conflict (id) do nothing;

-- A free slug made from text: "50% off Tuesdays!" -> "50-off-tuesdays", then "-2", "-3" if taken.
-- p_table is 'deals' or 'merchants'; p_exclude skips the row being edited.
create or replace function public.make_slug(p_text text, p_table text, p_exclude uuid default null)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_base text := trim(both '-' from left(
    trim(both '-' from regexp_replace(lower(coalesce(p_text, '')), '[^a-z0-9]+', '-', 'g')), 80));
  v_slug text;
  v_n int := 1;
  v_taken boolean;
begin
  if v_base = '' then
    v_base := case p_table when 'deals' then 'deal' else 'merchant' end;
  end if;
  v_slug := v_base;
  loop
    if p_table = 'deals' then
      select exists (select 1 from public.deals where slug = v_slug and id is distinct from p_exclude) into v_taken;
    else
      select exists (select 1 from public.merchants where slug = v_slug and id is distinct from p_exclude) into v_taken;
    end if;
    exit when not v_taken;
    v_n := v_n + 1;
    v_slug := v_base || '-' || v_n;
  end loop;
  return v_slug;
end;
$$;

-- Full picture of a deal (row plus details) for the audit log.
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
                         from public.coupon_codes c where c.deal_id = d.id), '[]')
  )
  from public.deals d
  where d.id = p_deal_id;
$$;

-- Full picture of a merchant (row plus branches with lat/lng) for the audit log.
create or replace function public.merchant_snapshot(p_merchant_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(m) || jsonb_build_object(
    'branches', coalesce((
      select jsonb_agg(
        to_jsonb(b) - 'location' - 'created_at' - 'updated_at' || jsonb_build_object(
          'lat', extensions.st_y(b.location::extensions.geometry),
          'lng', extensions.st_x(b.location::extensions.geometry)
        ) order by b.name, b.id)
      from public.merchant_branches b where b.merchant_id = m.id), '[]')
  )
  from public.merchants m
  where m.id = p_merchant_id;
$$;

-- Creates (no id) or updates a merchant and its branches in one step.
-- Branches with an id are updated, without an id are added, and branches left out are removed.
create or replace function public.admin_save_merchant(p_actor uuid, p_merchant jsonb, p_branches jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid := (p_merchant ->> 'id')::uuid;
  v_before jsonb;
  v_keep uuid[] := '{}';
  v_branch jsonb;
  v_branch_id uuid;
  v_location extensions.geography;
begin
  if v_id is null then
    insert into public.merchants (
      slug, name, description, logo_url, cover_url, website_url, domains, phone,
      primary_category_id, is_online, has_physical_stores, is_verified, status)
    select coalesce(r.slug, public.make_slug(r.name, 'merchants')), r.name, r.description, r.logo_url, r.cover_url, r.website_url,
      coalesce(r.domains, '{}'), r.phone, r.primary_category_id, coalesce(r.is_online, false),
      coalesce(r.has_physical_stores, true), coalesce(r.is_verified, false), coalesce(r.status, 'active')
    from jsonb_populate_record(null::public.merchants, p_merchant) r
    returning id into v_id;
  else
    v_before := public.merchant_snapshot(v_id);
    if v_before is null then
      raise exception 'merchant_not_found' using errcode = 'P0002';
    end if;
    update public.merchants m set
      slug = coalesce(r.slug, m.slug), name = r.name, description = r.description, logo_url = r.logo_url,
      cover_url = r.cover_url, website_url = r.website_url, domains = coalesce(r.domains, '{}'),
      phone = r.phone, primary_category_id = r.primary_category_id,
      is_online = coalesce(r.is_online, false), has_physical_stores = coalesce(r.has_physical_stores, true),
      is_verified = coalesce(r.is_verified, false), status = coalesce(r.status, 'active')
    from jsonb_populate_record(null::public.merchants, p_merchant) r
    where m.id = v_id;
  end if;

  for v_branch in select * from jsonb_array_elements(coalesce(p_branches, '[]')) loop
    v_location := case
      when v_branch ->> 'lat' is not null and v_branch ->> 'lng' is not null then
        extensions.st_setsrid(
          extensions.st_makepoint((v_branch ->> 'lng')::float8, (v_branch ->> 'lat')::float8), 4326
        )::extensions.geography
    end;
    v_branch_id := (v_branch ->> 'id')::uuid;
    if v_branch_id is null then
      insert into public.merchant_branches (
        merchant_id, name, address, city, district, location, opening_hours, phone, status)
      values (
        v_id, v_branch ->> 'name', v_branch ->> 'address', v_branch ->> 'city', v_branch ->> 'district',
        v_location, v_branch -> 'opening_hours', v_branch ->> 'phone',
        coalesce((v_branch ->> 'status')::public.merchant_status, 'active'))
      returning id into v_branch_id;
    else
      update public.merchant_branches set
        name = v_branch ->> 'name', address = v_branch ->> 'address', city = v_branch ->> 'city',
        district = v_branch ->> 'district', location = v_location,
        opening_hours = v_branch -> 'opening_hours', phone = v_branch ->> 'phone',
        status = coalesce((v_branch ->> 'status')::public.merchant_status, 'active')
      where id = v_branch_id and merchant_id = v_id;
      if not found then
        raise exception 'branch_not_found' using errcode = 'P0002';
      end if;
    end if;
    v_keep := v_keep || v_branch_id;
  end loop;

  delete from public.merchant_branches where merchant_id = v_id and id <> all (v_keep);

  insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_actor, case when v_before is null then 'create' else 'update' end, 'merchant', v_id,
          jsonb_build_object('before', v_before, 'after', public.merchant_snapshot(v_id)));
  return v_id;
end;
$$;

-- Creates (no id) or updates a deal and replaces its branches, eligible cards, schedules and coupons.
-- New deals start as drafts; status changes go through admin_set_deal_status.
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
      how_to_redeem, channel, source_url, proof_image_url, image_url, affiliate_url, verification,
      starts_at, ends_at, is_featured, featured_until, created_by, origin, status)
    select r.merchant_id, coalesce(r.slug, public.make_slug(r.title, 'deals')), r.title, r.description, r.category_id, r.brand_id, r.deal_type,
      r.discount_percent, r.discount_amount_lkr, r.max_saving_lkr, r.min_spend_lkr, r.original_price_lkr,
      r.deal_price_lkr, r.terms, r.how_to_redeem, coalesce(r.channel, 'in_store'), r.source_url,
      r.proof_image_url, r.image_url, r.affiliate_url, coalesce(r.verification, 'unverified'),
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

-- Publish, pause, resume, end or reject a deal. Publishing sets the first recheck date.
create or replace function public.admin_set_deal_status(p_actor uuid, p_deal_id uuid, p_status public.deal_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_deal public.deals;
begin
  select * into v_deal from public.deals where id = p_deal_id for update;
  if not found then
    raise exception 'deal_not_found' using errcode = 'P0002';
  end if;
  if not (
    (p_status = 'live' and v_deal.status in ('draft', 'pending', 'paused'))
    or (p_status = 'paused' and v_deal.status = 'live')
    or (p_status = 'expired' and v_deal.status in ('live', 'paused'))
    or (p_status = 'rejected' and v_deal.status = 'pending')
    or (p_status = 'draft' and v_deal.status in ('paused', 'rejected'))
  ) then
    raise exception 'invalid_status_change' using errcode = '22023';
  end if;
  if p_status = 'live' and v_deal.ends_at is not null and v_deal.ends_at <= now() then
    raise exception 'deal_already_ended' using errcode = '22023';
  end if;

  update public.deals set
    status = p_status,
    last_checked_at = case when p_status = 'live' then coalesce(last_checked_at, now()) else last_checked_at end,
    recheck_due_at = case when p_status = 'live' then coalesce(recheck_due_at, now() + interval '14 days') else recheck_due_at end
  where id = p_deal_id;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_actor, 'set_status', 'deal', p_deal_id,
          jsonb_build_object('status', jsonb_build_object('from', v_deal.status, 'to', p_status)));
end;
$$;

-- Admin confirmed the deal is still running: record it and schedule the next check.
create or replace function public.admin_mark_deal_checked(p_actor uuid, p_deal_id uuid, p_recheck_days int default 14)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.deals set
    last_checked_at = now(),
    recheck_due_at = now() + make_interval(days => greatest(1, least(p_recheck_days, 90)))
  where id = p_deal_id;
  if not found then
    raise exception 'deal_not_found' using errcode = 'P0002';
  end if;
  insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
  values (p_actor, 'mark_checked', 'deal', p_deal_id, jsonb_build_object('recheck_days', p_recheck_days));
end;
$$;

-- Marks live and paused deals past their end time as expired. Run every 5 minutes by the API cron.
create or replace function public.expire_deals()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count int;
begin
  with expired as (
    update public.deals set status = 'expired'
    where status in ('live', 'paused') and ends_at is not null and ends_at <= now()
    returning id, status
  ), logged as (
    insert into public.audit_log (actor_id, action, entity_type, entity_id, diff)
    select null, 'expire', 'deal', id, jsonb_build_object('reason', 'ends_at passed') from expired
    returning 1
  )
  select count(*) into v_count from logged;
  return v_count;
end;
$$;

-- Possible duplicates: open deals at the same merchant with a similar title.
create or replace function public.admin_find_duplicate_deals(p_merchant_id uuid, p_title text, p_exclude_id uuid default null)
returns table (id uuid, slug text, title text, status public.deal_status, similarity real)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.slug::text, d.title, d.status, extensions.similarity(d.title, p_title)
  from public.deals d
  where d.merchant_id = p_merchant_id
    and d.status in ('draft', 'pending', 'live', 'paused')
    and (p_exclude_id is null or d.id <> p_exclude_id)
    and extensions.similarity(d.title, p_title) >= 0.4
  order by 5 desc
  limit 5;
$$;

-- Saves many deals in one call (CSV import), all or nothing. Each item has the same parts as
-- admin_save_deal: {deal, branch_ids, eligibility, schedules, coupons}. One call keeps the API
-- under the Workers limit on outgoing requests.
create or replace function public.admin_import_deals(p_actor uuid, p_items jsonb)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_ids uuid[] := '{}';
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_ids := v_ids || public.admin_save_deal(
      p_actor,
      v_item -> 'deal',
      array(select jsonb_array_elements_text(coalesce(v_item -> 'branch_ids', '[]'))::uuid),
      v_item -> 'eligibility',
      v_item -> 'schedules',
      v_item -> 'coupons'
    );
  end loop;
  return v_ids;
end;
$$;

-- Only the API (service role) may call these.
revoke execute on function public.admin_import_deals(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.admin_import_deals(uuid, jsonb) to service_role;
revoke execute on function public.make_slug(text, text, uuid) from public, anon, authenticated;
revoke execute on function public.deal_snapshot(uuid) from public, anon, authenticated;
revoke execute on function public.merchant_snapshot(uuid) from public, anon, authenticated;
revoke execute on function public.admin_save_merchant(uuid, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_save_deal(uuid, jsonb, uuid[], jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_set_deal_status(uuid, uuid, public.deal_status) from public, anon, authenticated;
revoke execute on function public.admin_mark_deal_checked(uuid, uuid, int) from public, anon, authenticated;
revoke execute on function public.expire_deals() from public, anon, authenticated;
revoke execute on function public.admin_find_duplicate_deals(uuid, text, uuid) from public, anon, authenticated;
grant execute on function public.make_slug(text, text, uuid) to service_role;
grant execute on function public.deal_snapshot(uuid) to service_role;
grant execute on function public.merchant_snapshot(uuid) to service_role;
grant execute on function public.admin_save_merchant(uuid, jsonb, jsonb) to service_role;
grant execute on function public.admin_save_deal(uuid, jsonb, uuid[], jsonb, jsonb, jsonb) to service_role;
grant execute on function public.admin_set_deal_status(uuid, uuid, public.deal_status) to service_role;
grant execute on function public.admin_mark_deal_checked(uuid, uuid, int) to service_role;
grant execute on function public.expire_deals() to service_role;
grant execute on function public.admin_find_duplicate_deals(uuid, text, uuid) to service_role;
