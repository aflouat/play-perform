-- Level (1 → 5) of each learner in each skill. XP stays on the account (scores); the level is per skill.
-- Access only through the API routes (service role): RLS enabled without policies.
create table public.skill_levels (
  profile_id text not null,
  skill_id   text not null,
  level      smallint not null check (level between 1 and 5),
  updated_at timestamptz not null default now(),
  primary key (profile_id, skill_id)
);

alter table public.skill_levels enable row level security;
