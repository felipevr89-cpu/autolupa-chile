create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.listing_status as enum ('pending', 'active', 'rejected', 'sold', 'expired');
create type public.listing_fuel as enum ('gasolina', 'diesel', 'electrico', 'hibrido', 'hibrido_enchufable');
create type public.listing_transmission as enum ('manual', 'automatica');
create type public.listing_report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('member', 'moderator', 'admin')),
  created_at timestamptz not null default now()
);

create table public.used_listings (
  id uuid primary key default extensions.gen_random_uuid(),
  seller_id uuid not null references auth.users(id) on delete cascade,
  status public.listing_status not null default 'pending',
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  brand text not null check (char_length(brand) between 1 and 60),
  model text not null check (char_length(model) between 1 and 80),
  year smallint not null check (year between 1900 and 2100),
  price_clp bigint not null check (price_clp between 100000 and 2000000000),
  mileage_km integer not null check (mileage_km between 0 and 2000000),
  fuel public.listing_fuel not null,
  transmission public.listing_transmission not null,
  color text check (char_length(color) <= 40),
  region text not null check (char_length(region) between 2 and 80),
  commune text check (char_length(commune) <= 80),
  description text not null check (char_length(description) between 20 and 2000),
  contact_name text not null check (char_length(contact_name) between 2 and 80),
  contact_phone text not null check (contact_phone ~ '^\+[0-9]{8,15}$'),
  contact_email text check (contact_email is null or contact_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  terms_accepted_version text not null check (char_length(terms_accepted_version) between 1 and 20),
  photo_paths text[] not null default '{}' check (cardinality(photo_paths) between 1 and 8),
  moderation_note text,
  featured_until timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_reports (
  id uuid primary key default extensions.gen_random_uuid(),
  listing_id uuid not null references public.used_listings(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 10 and 1000),
  status public.listing_report_status not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  favorite_car_ids integer[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.document_signatures (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null check (document_type in ('privacy_policy', 'responsibility_declaration')),
  document_version text not null check (char_length(document_version) between 1 and 20),
  signed_at timestamptz not null default now(),
  unique (user_id, document_type, document_version)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger used_listings_set_updated_at
before update on public.used_listings
for each row execute function public.set_updated_at();

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, display_name, avatar_url)
select id, raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

create or replace function public.used_listing_paths_belong_to(paths text[], owner_id uuid)
returns boolean
language sql
immutable
as $$
  select coalesce(bool_and(photo_path like owner_id::text || '/%'), false)
  from unnest(paths) as photo_path;
$$;

revoke all on function public.used_listing_paths_belong_to(text[], uuid) from public;
grant execute on function public.used_listing_paths_belong_to(text[], uuid) to authenticated;

alter table public.used_listings
  add constraint used_listings_photos_belong_to_seller
  check (public.used_listing_paths_belong_to(photo_paths, seller_id));

create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from private.user_roles
    where user_id = auth.uid()
      and role in ('moderator', 'admin')
  );
$$;

grant execute on function public.is_moderator() to anon, authenticated;

create or replace function public.used_listing_status_transition_is_valid(from_status public.listing_status, to_status public.listing_status)
returns boolean
language sql
immutable
as $$
  select
    from_status = to_status
    or (from_status = 'pending' and to_status in ('active', 'rejected'))
    or (from_status = 'rejected' and to_status in ('pending', 'active'))
    or (from_status = 'active' and to_status in ('sold', 'expired', 'pending'));
$$;

revoke all on function public.used_listing_status_transition_is_valid(public.listing_status, public.listing_status) from public;
grant execute on function public.used_listing_status_transition_is_valid(public.listing_status, public.listing_status) to authenticated;

create or replace function public.protect_used_listing_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.used_listing_status_transition_is_valid(old.status, new.status) then
    raise exception 'Transicion de estado no permitida: % -> %', old.status, new.status;
  end if;

  if public.is_moderator() then
    return new;
  end if;

  if auth.uid() is distinct from old.seller_id then
    raise exception 'Not authorized';
  end if;

  new.id := old.id;
  new.seller_id := old.seller_id;
  new.created_at := old.created_at;
  new.slug := old.slug;
  new.moderation_note := old.moderation_note;
  new.featured_until := old.featured_until;
  new.published_at := old.published_at;
  new.expires_at := old.expires_at;

  if old.status = 'active' and new.status = 'sold' then
    return new;
  end if;

  if old.status = 'active' and new.status = 'active' and (
    new.brand is distinct from old.brand
    or new.model is distinct from old.model
    or new.year is distinct from old.year
    or new.price_clp is distinct from old.price_clp
    or new.mileage_km is distinct from old.mileage_km
    or new.fuel is distinct from old.fuel
    or new.transmission is distinct from old.transmission
    or new.color is distinct from old.color
    or new.region is distinct from old.region
    or new.commune is distinct from old.commune
    or new.description is distinct from old.description
    or new.contact_name is distinct from old.contact_name
    or new.contact_phone is distinct from old.contact_phone
    or new.contact_email is distinct from old.contact_email
    or new.photo_paths is distinct from old.photo_paths
  ) then
    new.status := 'pending';
    new.published_at := null;
    new.expires_at := null;
  else
    new.status := old.status;
  end if;

  return new;
end;
$$;

create trigger used_listings_protect_changes
before update on public.used_listings
for each row execute function public.protect_used_listing_changes();

create or replace function public.mark_used_listing_sold(listing_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.used_listings
  set status = 'sold'
  where id = listing_id
    and seller_id = auth.uid()
    and status = 'active';

  if not found then
    raise exception 'No se pudo marcar el aviso como vendido.';
  end if;
end;
$$;

revoke all on function public.mark_used_listing_sold(uuid) from public;
grant execute on function public.mark_used_listing_sold(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.used_listings enable row level security;
alter table public.listing_reports enable row level security;
alter table public.user_preferences enable row level security;
alter table public.document_signatures enable row level security;

create policy "Public profiles are readable"
on public.profiles for select
to anon, authenticated
using (true);

create policy "Public active listings are readable"
on public.used_listings for select
to anon, authenticated
using (
  (
    status = 'active'
    and published_at <= now()
    and (expires_at is null or expires_at > now())
  )
  or seller_id = auth.uid()
  or public.is_moderator()
);

create policy "Authenticated sellers create pending listings"
on public.used_listings for insert
to authenticated
with check (
  seller_id = auth.uid()
  and status = 'pending'
  and published_at is null
  and expires_at is null
  and moderation_note is null
  and featured_until is null
  and terms_accepted_version = '1.1'
);

create policy "Sellers and moderators update listings"
on public.used_listings for update
to authenticated
using (seller_id = auth.uid() or public.is_moderator())
with check (seller_id = auth.uid() or public.is_moderator());

create policy "Moderators delete listings"
on public.used_listings for delete
to authenticated
using (public.is_moderator());

create policy "Authenticated users report listings"
on public.listing_reports for insert
to authenticated
with check (reporter_id = auth.uid());

create policy "Reporters and moderators read reports"
on public.listing_reports for select
to authenticated
using (reporter_id = auth.uid() or public.is_moderator());

create policy "Moderators update reports"
on public.listing_reports for update
to authenticated
using (public.is_moderator())
with check (public.is_moderator());

create policy "Users manage their preferences"
on public.user_preferences for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users read their signatures"
on public.document_signatures for select
to authenticated
using (user_id = auth.uid());

create policy "Users create their signatures"
on public.document_signatures for insert
to authenticated
with check (user_id = auth.uid());

create index used_listings_active_created_idx
on public.used_listings (published_at desc)
where status = 'active';

create index used_listings_brand_model_idx
on public.used_listings (brand, model);

create index used_listings_region_price_idx
on public.used_listings (region, price_clp)
where status = 'active';

create index used_listings_search_idx
on public.used_listings
using gin (to_tsvector('spanish', brand || ' ' || model || ' ' || description));

create index listing_reports_open_idx
on public.listing_reports (created_at)
where status in ('open', 'reviewing');

grant select on public.profiles to anon, authenticated;
grant select on public.used_listings to anon, authenticated;
grant insert, update, delete on public.used_listings to authenticated;
grant select, insert, update on public.listing_reports to authenticated;
grant select, insert, update on public.user_preferences to authenticated;
grant select, insert on public.document_signatures to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Sellers read their own listing photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Sellers upload their listing photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
  and (storage.foldername(name))[2] is not null
);

create policy "Sellers update their listing photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Sellers delete their listing photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);
