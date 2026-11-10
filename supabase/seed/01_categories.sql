-- Seed: deal categories (top level, plus a few sub-categories under Food & Dining).
-- Loaded by `supabase db reset` locally and once into staging; safe to re-run.

insert into public.categories (slug, name, icon, sort_order) values
  ('food-dining', 'Food & Dining', 'utensils', 10),
  ('supermarkets-groceries', 'Supermarkets & Groceries', 'shopping-basket', 20),
  ('fashion', 'Fashion & Clothing', 'shirt', 30),
  ('electronics', 'Electronics & Appliances', 'smartphone', 40),
  ('hotels-travel', 'Hotels & Travel', 'plane', 50),
  ('health-beauty', 'Health & Beauty', 'heart-pulse', 60),
  ('home-living', 'Home & Furniture', 'sofa', 70),
  ('jewellery-watches', 'Jewellery & Watches', 'gem', 80),
  ('entertainment', 'Movies & Entertainment', 'clapperboard', 90),
  ('online-shopping', 'Online Shopping', 'shopping-cart', 100),
  ('fuel-transport', 'Fuel & Transport', 'fuel', 110),
  ('education', 'Education & Books', 'book-open', 120),
  ('kids-toys', 'Kids & Toys', 'baby', 130),
  ('services', 'Services & Utilities', 'wrench', 140)
on conflict (slug) do nothing;

insert into public.categories (slug, name, icon, sort_order, parent_id)
select v.slug, v.name, v.icon, v.sort_order, p.id
from (values
  ('restaurants', 'Restaurants', 'utensils', 11),
  ('cafes-bakeries', 'Cafés & Bakeries', 'coffee', 12),
  ('fast-food-delivery', 'Fast Food & Delivery', 'pizza', 13)
) as v (slug, name, icon, sort_order)
cross join public.categories p
where p.slug = 'food-dining'
on conflict (slug) do nothing;
