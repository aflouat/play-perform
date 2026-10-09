-- Competition: pseudonyms in rankings, weekly challenge results, revocable medals.
-- Access only through the API routes (service role): RLS enabled without policies.
alter table public.students add column if not exists nickname text;
alter table public.students add column if not exists show_in_ranking boolean not null default true;
create unique index if not exists students_nickname_org_idx on public.students (organization_id, lower(nickname)) where nickname is not null;

create table public.challenge_results (
  id              uuid primary key default gen_random_uuid(),
  profile_id      text not null,
  organization_id uuid not null references public.organizations(id),
  week            text not null,
  skill_id        text not null,
  correct         smallint not null check (correct >= 0),
  total           smallint not null check (total > 0),
  duration_ms     integer not null check (duration_ms >= 0),
  created_at      timestamptz not null default now(),
  unique (profile_id, week)
);
create index challenge_results_org_week_idx on public.challenge_results (organization_id, week);

-- A teacher removes an automatic medal: the row hides it, nobody takes its place.
create table public.reward_revocations (
  profile_id text not null,
  week       text not null,
  revoked_at timestamptz not null default now(),
  primary key (profile_id, week)
);

alter table public.challenge_results  enable row level security;
alter table public.reward_revocations enable row level security;
