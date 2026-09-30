create or replace function public.require_verified_seller()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  claims jsonb := coalesce(auth.jwt(), '{}'::jsonb);
  verified_email text := nullif(lower(claims ->> 'email'), '');
  has_oauth_identity boolean := exists (
    select 1 from auth.identities i
    where i.user_id = auth.uid() and i.provider <> 'email'
  );
begin
  if auth.uid() is distinct from new.seller_id then
    return new;
  end if;

  if verified_email is null then
    raise exception 'Debes confirmar tu correo electronico antes de publicar.';
  end if;

  if not has_oauth_identity then
    if new.contact_email is null or lower(new.contact_email) <> verified_email then
      raise exception 'El correo de contacto debe ser el correo que confirmaste.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists require_verified_seller on public.used_listings;
create trigger require_verified_seller
  before insert or update on public.used_listings
  for each row
  execute function public.require_verified_seller();

revoke all on function public.require_verified_seller() from public;
revoke all on function public.require_verified_seller() from anon;
grant execute on function public.require_verified_seller() to authenticated;
