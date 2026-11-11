-- Seed data tests: reference data that M1 requires is present.
-- Run with `pnpm db:test` and in CI.
begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select ok((select count(*) from public.categories) >= 10, 'at least 10 categories');
select ok((select count(*) from public.providers) >= 15, 'at least 15 providers');
select ok((select count(*) from public.card_products) >= 40, 'at least 40 card products');
select is(
  (select count(*)::int from public.providers p
   where not exists (select 1 from public.card_products c where c.provider_id = p.id)),
  0,
  'every provider has at least one card product'
);

select * from finish();
rollback;
