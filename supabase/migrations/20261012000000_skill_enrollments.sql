-- Requests to join a course (skill): the learner reads the course sheet, states their motivations,
-- the training centre approves or refuses. Access only through the API routes (service role).
create table public.skill_enrollments (
  id             uuid primary key default gen_random_uuid(),
  profile_id     text not null,
  skill_id       text not null,
  motivation     text not null,
  status         text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  center_comment text,
  created_at     timestamptz not null default now(),
  decided_at     timestamptz
);

create index skill_enrollments_profile_idx on public.skill_enrollments (profile_id, skill_id);
create index skill_enrollments_pending_idx on public.skill_enrollments (status, created_at);

alter table public.skill_enrollments enable row level security;
