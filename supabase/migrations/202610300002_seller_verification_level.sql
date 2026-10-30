alter table public.profiles
  add column if not exists verification_level text not null default 'none'
  check (verification_level in ('none', 'verified', 'history_checked', 'featured'));
