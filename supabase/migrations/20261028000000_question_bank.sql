-- Banque de questions pilotée par la base : les quiz lisent les questions publiées,
-- les banques intégrées au code servent de secours (et de graine via /admin/questions).
alter table public.questions add column if not exists skill_id text;
alter table public.questions add column if not exists status text not null default 'published';
alter table public.questions add column if not exists hint text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'questions_status_check') then
    alter table public.questions add constraint questions_status_check check (status in ('draft', 'published'));
  end if;
end $$;

create index if not exists questions_skill_idx on public.questions (skill_id) where skill_id is not null;
create index if not exists questions_subject_idx on public.questions (subject);

-- RLS : lecture publique des questions publiées ; écriture réservée à la clé service (API admin)
alter table public.questions enable row level security;
drop policy if exists questions_public_read on public.questions;
create policy questions_public_read on public.questions for select using (status = 'published');
