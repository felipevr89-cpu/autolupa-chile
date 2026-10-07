alter table public.profiles
  add column if not exists email_verified boolean not null default false;

create or replace function public.sync_profile_email_verified()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email_verified = (new.email_confirmed_at is not null)
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_profile_email_verified on auth.users;

create trigger sync_profile_email_verified
after insert or update of email_confirmed_at on auth.users
for each row
execute function public.sync_profile_email_verified();

update public.profiles p
   set email_verified = (u.email_confirmed_at is not null)
  from auth.users u
 where u.id = p.id
   and p.email_verified is distinct from (u.email_confirmed_at is not null);

notify pgrst, 'reload schema';
