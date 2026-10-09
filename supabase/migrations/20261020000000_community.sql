-- Community: anonymous answer statistics, activity feed with cheers, weekly pair bonus claims.
-- Access only through the API routes (service role): RLS enabled without policies.

-- How learners answer each question (counts per option, never per person) -> "classic traps".
create table public.answer_stats (
  question_id text not null,
  option_id   text not null check (option_id in ('A', 'B', 'C', 'D')),
  count       bigint not null default 0,
  primary key (question_id, option_id)
);

create function public.bump_answer_stat(p_question text, p_option text) returns void
language sql as $$
  insert into public.answer_stats (question_id, option_id, count) values (p_question, p_option, 1)
  on conflict (question_id, option_id) do update set count = public.answer_stats.count + 1;
$$;

-- Milestones shown in the centre's activity feed (level 4 and mastery), one per learner, skill and level.
create table public.activity_events (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id),
  profile_id      text not null,
  skill_id        text not null,
  level           smallint not null check (level between 1 and 5),
  hidden          boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (profile_id, skill_id, level)
);
create index activity_events_org_idx on public.activity_events (organization_id, created_at desc);

create table public.activity_cheers (
  event_id   uuid not null references public.activity_events(id) on delete cascade,
  profile_id text not null,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

-- A pair bonus can be claimed once per learner and week.
create table public.pair_bonus_claims (
  profile_id text not null,
  week       text not null,
  xp         smallint not null,
  claimed_at timestamptz not null default now(),
  primary key (profile_id, week)
);

alter table public.answer_stats      enable row level security;
alter table public.activity_events   enable row level security;
alter table public.activity_cheers   enable row level security;
alter table public.pair_bonus_claims enable row level security;
