-- Open-question evaluations written by learners and corrected by an examiner (admin).
-- Access only through the API routes (service role): RLS enabled without policies.
create table public.skill_evaluations (
  id               uuid primary key default gen_random_uuid(),
  profile_id       text not null,
  skill_id         text not null,
  level            smallint not null check (level between 1 and 5),
  prompt           text not null,
  answer           text not null,
  status           text not null default 'pending' check (status in ('pending', 'passed', 'failed')),
  examiner_comment text,
  created_at       timestamptz not null default now(),
  corrected_at     timestamptz
);

create index skill_evaluations_profile_idx on public.skill_evaluations (profile_id, skill_id);
create index skill_evaluations_pending_idx on public.skill_evaluations (status, created_at);

alter table public.skill_evaluations enable row level security;
