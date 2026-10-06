create or replace function public.enforce_publish_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_count integer;
  recent_count integer;
begin
  if auth.uid() is null then
    return new;
  end if;

  select count(*) into active_count
  from public.used_listings
  where seller_id = new.seller_id
    and status = 'active';

  if active_count >= 20 then
    raise exception 'Este vendedor ya tiene 20 avisos activos. Retira uno antes de publicar otro.';
  end if;

  select count(*) into recent_count
  from public.used_listings
  where seller_id = new.seller_id
    and created_at > now() - interval '24 hours';

  if recent_count >= 5 then
    raise exception 'Alcanzaste el limite de 5 publicaciones cada 24 horas.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_publish_limits on public.used_listings;
create trigger enforce_publish_limits
  before insert on public.used_listings
  for each row
  execute function public.enforce_publish_limits();

revoke all on function public.enforce_publish_limits() from public;
revoke all on function public.enforce_publish_limits() from anon;
grant execute on function public.enforce_publish_limits() to authenticated;
