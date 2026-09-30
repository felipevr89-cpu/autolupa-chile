create table public.suggestions (
  id uuid primary key default gen_random_uuid(),
  kind text not null
    check (kind in ('reclamo', 'sugerencia')),
  title text not null
    check (char_length(btrim(title)) between 5 and 120),
  body text not null
    check (char_length(btrim(body)) between 10 and 2000),
  email text not null default ''
    check (char_length(email) <= 254),
  status text not null default 'open'
    check (status in ('open', 'answered', 'closed')),
  answer text
    check (answer is null or char_length(btrim(answer)) between 5 and 2000),
  answered_at timestamptz,
  created_at timestamptz not null default now(),
  constraint suggestions_answer_consistency check (
    (status = 'answered') = (answer is not null and answered_at is not null)
  )
);

alter table public.suggestions enable row level security;

create policy "Suggestions with a public answer are readable"
on public.suggestions for select
to anon, authenticated
using (status in ('answered', 'closed'));

create policy "Moderators read every suggestion"
on public.suggestions for select
to authenticated
using (public.is_moderator());

create policy "Anyone can send a suggestion"
on public.suggestions for insert
to anon, authenticated
with check (
  status = 'open'
  and answer is null
  and answered_at is null
);

create policy "Moderators answer suggestions"
on public.suggestions for update
to authenticated
using (public.is_moderator())
with check (public.is_moderator());

create policy "Moderators delete suggestions"
on public.suggestions for delete
to authenticated
using (public.is_moderator());

create index suggestions_public_idx
on public.suggestions (answered_at desc)
where status in ('answered', 'closed');

create index suggestions_open_idx
on public.suggestions (created_at)
where status = 'open';

grant select, insert on public.suggestions to anon, authenticated;
grant update, delete on public.suggestions to authenticated;
