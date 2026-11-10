-- Seed: starting card products per provider. PLACEHOLDER NAMES: generic card families,
-- to be checked against each bank's real product list and corrected in the admin tool (M3).

insert into public.card_products (provider_id, name, card_type, network)
select p.id, v.name, v.card_type::public.card_type, v.network::public.card_network
from (values
  ('commercial-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('commercial-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('commercial-bank', 'Debit Card', 'debit', 'visa'),
  ('sampath-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('sampath-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('sampath-bank', 'Debit Card', 'debit', 'visa'),
  ('hnb', 'Visa Credit Card', 'credit', 'visa'),
  ('hnb', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('hnb', 'Debit Card', 'debit', 'visa'),
  ('nations-trust-bank', 'American Express Credit Card', 'credit', 'amex'),
  ('nations-trust-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('nations-trust-bank', 'Debit Card', 'debit', 'visa'),
  ('seylan-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('seylan-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('seylan-bank', 'Debit Card', 'debit', 'visa'),
  ('boc', 'Visa Credit Card', 'credit', 'visa'),
  ('boc', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('boc', 'Debit Card', 'debit', 'visa'),
  ('peoples-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('peoples-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('peoples-bank', 'Debit Card', 'debit', 'visa'),
  ('dfcc-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('dfcc-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('dfcc-bank', 'Debit Card', 'debit', 'visa'),
  ('ndb-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('ndb-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('ndb-bank', 'Debit Card', 'debit', 'visa'),
  ('pan-asia-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('pan-asia-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('pan-asia-bank', 'Debit Card', 'debit', 'visa'),
  ('union-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('union-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('union-bank', 'Debit Card', 'debit', 'visa'),
  ('cargills-bank', 'Visa Credit Card', 'credit', 'visa'),
  ('cargills-bank', 'Mastercard Credit Card', 'credit', 'mastercard'),
  ('cargills-bank', 'Debit Card', 'debit', 'visa'),
  ('dialog', 'Dialog Star Points', 'loyalty', 'none'),
  ('dialog', 'Dialog Postpaid', 'other', 'none'),
  ('slt-mobitel', 'Mobitel Postpaid', 'other', 'none'),
  ('hutch', 'Hutch Postpaid', 'other', 'none')
) as v (provider_slug, name, card_type, network)
join public.providers p on p.slug = v.provider_slug
on conflict (provider_id, name) do nothing;
