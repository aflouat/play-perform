-- Staffing of the orals.
-- 1. "Peut faire passer les oraux": the centre (manager) enables it for some of its teachers or examiners;
--    only them open oral slots. Existing examiners keep giving orals (seeded below).
-- 2. Waiting list: a learner of the final oral phase finds no free slot in their centre → a request waits;
--    the centre finds an examiner; the request closes when the learner books.
-- Service role only (API routes): RLS on, no policy.
create table if not exists public.oral_examiners (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  granted_by      uuid references auth.users(id) on delete set null,
  granted_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);

insert into public.oral_examiners (organization_id, user_id)
select distinct organization_id, user_id from public.memberships where role = 'examiner'
on conflict do nothing;

create table if not exists public.oral_requests (
  id              uuid primary key default gen_random_uuid(),
  profile_id      text not null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  skill_id        text not null,
  level           smallint not null check (level between 1 and 5),
  status          text not null default 'waiting' check (status in ('waiting', 'booked', 'cancelled')),
  created_at      timestamptz not null default now(),
  resolved_at     timestamptz
);
-- One waiting request per learner and skill
create unique index if not exists oral_requests_waiting_idx on public.oral_requests (profile_id, skill_id) where status = 'waiting';
create index if not exists oral_requests_org_idx on public.oral_requests (organization_id, status);

alter table public.oral_examiners enable row level security;
alter table public.oral_requests enable row level security;
