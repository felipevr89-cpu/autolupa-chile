create table if not exists public.site_visits (
  day date primary key,
  visits integer not null default 0 check (visits >= 0)
);

create table if not exists public.used_listing_views (
  listing_id uuid primary key references public.used_listings(id) on delete cascade,
  views integer not null default 0 check (views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.site_visits enable row level security;
alter table public.used_listing_views enable row level security;

revoke all on public.site_visits from anon, authenticated;
revoke all on public.used_listing_views from anon, authenticated;

create or replace function public.register_site_visit()
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.site_visits (day, visits)
  values ((now() at time zone 'America/Santiago')::date, 1)
  on conflict (day) do update set visits = public.site_visits.visits + 1;
$$;

create or replace function public.site_visits_last_30_days()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(visits), 0)::integer
  from public.site_visits
  where day > (now() at time zone 'America/Santiago')::date - 30;
$$;

create or replace function public.register_listing_view(p_listing_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  result integer;
begin
  if not exists (select 1 from public.used_listings where id = p_listing_id and status = 'active') then
    return null;
  end if;
  insert into public.used_listing_views (listing_id, views)
  values (p_listing_id, 1)
  on conflict (listing_id) do update
    set views = public.used_listing_views.views + 1, updated_at = now()
  returning views into result;
  return result;
end;
$$;

create or replace function public.get_listing_views(p_listing_ids uuid[])
returns table (listing_id uuid, views integer)
language sql
stable
security definer
set search_path = public
as $$
  select v.listing_id, v.views
  from public.used_listing_views v
  where v.listing_id = any(p_listing_ids)
  limit 200;
$$;

revoke all on function public.register_site_visit() from public;
revoke all on function public.site_visits_last_30_days() from public;
revoke all on function public.register_listing_view(uuid) from public;
revoke all on function public.get_listing_views(uuid[]) from public;

grant execute on function public.register_site_visit() to anon, authenticated;
grant execute on function public.site_visits_last_30_days() to anon, authenticated;
grant execute on function public.register_listing_view(uuid) to anon, authenticated;
grant execute on function public.get_listing_views(uuid[]) to anon, authenticated;
