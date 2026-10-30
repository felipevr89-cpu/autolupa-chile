create table if not exists public.used_listing_leads (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.used_listings(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists used_listing_leads_listing_id_idx on public.used_listing_leads (listing_id);

alter table public.used_listing_leads enable row level security;

create policy "used_listing_leads_insert_public"
  on public.used_listing_leads for insert
  to anon, authenticated
  with check (true);

create policy "used_listing_leads_select_seller"
  on public.used_listing_leads for select
  to authenticated
  using (
    exists (
      select 1 from public.used_listings listing
      where listing.id = used_listing_leads.listing_id
        and listing.seller_id = auth.uid()
    )
  );
