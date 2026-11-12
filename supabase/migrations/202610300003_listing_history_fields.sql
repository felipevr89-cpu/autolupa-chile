alter table public.used_listings
  add column if not exists vin text,
  add column if not exists owners_count integer,
  add column if not exists maintenance_history text,
  add column if not exists fines_status text,
  add column if not exists liens_status text;
