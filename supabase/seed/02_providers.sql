-- Seed: card and offer providers in Sri Lanka (banks and telcos).
-- Logos are added later through the admin tool; safe to re-run.

insert into public.providers (slug, name, type) values
  ('commercial-bank', 'Commercial Bank', 'bank'),
  ('sampath-bank', 'Sampath Bank', 'bank'),
  ('hnb', 'Hatton National Bank (HNB)', 'bank'),
  ('nations-trust-bank', 'Nations Trust Bank', 'bank'),
  ('seylan-bank', 'Seylan Bank', 'bank'),
  ('boc', 'Bank of Ceylon', 'bank'),
  ('peoples-bank', 'People''s Bank', 'bank'),
  ('dfcc-bank', 'DFCC Bank', 'bank'),
  ('ndb-bank', 'NDB Bank', 'bank'),
  ('pan-asia-bank', 'Pan Asia Bank', 'bank'),
  ('union-bank', 'Union Bank', 'bank'),
  ('cargills-bank', 'Cargills Bank', 'bank'),
  ('dialog', 'Dialog', 'telco'),
  ('slt-mobitel', 'SLT-Mobitel', 'telco'),
  ('hutch', 'Hutch', 'telco')
on conflict (slug) do nothing;
