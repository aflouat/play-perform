-- =============================================================
-- Schéma initial — reconstruit depuis la prod (synthedu-play-perform)
-- le 2026-09-27. Reproduit fidèlement tables, contraintes, index et
-- politiques RLS existants (y compris les politiques permissives,
-- à durcir lors de l'Epic sécurité).
-- =============================================================

create extension if not exists pgcrypto;

-- ── students : élèves rattachés à un compte parent ─────────────
create table public.students (
  id            uuid primary key default gen_random_uuid(),
  parent_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name          text not null,
  emoji         text not null default '🎓',
  gradient      text not null default 'from-sky-400 to-blue-500',
  grade         text not null default 'CE1',
  tagline       text not null default '',
  age           integer not null default 10,
  created_at    timestamptz default now(),
  mode          text not null default 'quiz' check (mode in ('quiz', 'words', 'keyboard')),
  learning_mode text not null default 'advanced' check (learning_mode in ('assisted', 'advanced'))
);

-- ── profiles : profil de jeu (id texte = id élève ou profil statique)
create table public.profiles (
  id         text primary key,
  name       text not null,
  emoji      text not null,
  grade      text not null,
  mode       text not null,
  created_at timestamptz default now()
);

create table public.scores (
  id               uuid primary key default gen_random_uuid(),
  profile_id       text not null unique references public.profiles(id) on delete cascade,
  xp               integer not null default 0,
  level            integer not null default 1,
  streak           integer not null default 0,
  last_activity_at timestamptz,
  updated_at       timestamptz default now()
);

create table public.badges (
  id          uuid primary key default gen_random_uuid(),
  profile_id  text not null references public.profiles(id) on delete cascade,
  badge_id    text not null,
  unlocked_at timestamptz default now(),
  unique (profile_id, badge_id)
);

create table public.quiz_answers (
  id          uuid primary key default gen_random_uuid(),
  profile_id  text not null references public.profiles(id) on delete cascade,
  subject     text not null,
  question_id text not null,
  is_correct  boolean not null,
  xp_earned   integer not null default 0,
  answered_at timestamptz default now()
);

create table public.keyboard_progress (
  id         uuid primary key default gen_random_uuid(),
  profile_id text not null references public.profiles(id) on delete cascade,
  mode       text not null,
  level      integer not null default 1,
  score      integer not null default 0,
  total      integer not null default 0,
  played_at  timestamptz default now()
);

-- ── questions : banque importée via CSV / admin ─────────────────
create table public.questions (
  id                   text primary key,
  subject              text not null,
  category             text,
  difficulty           smallint not null check (difficulty between 1 and 4),
  xp_reward            smallint not null,
  emoji                text,
  image_url            text,
  question             text not null,
  question_assisted    text,
  option_a             text not null,
  option_b             text not null,
  option_c             text not null,
  option_d             text not null,
  option_a_assisted    text,
  option_b_assisted    text,
  option_c_assisted    text,
  option_d_assisted    text,
  correct_option_id    text not null check (correct_option_id in ('A', 'B', 'C', 'D')),
  explanation          text not null,
  explanation_assisted text,
  created_at           timestamptz default now()
);

create table public.release_notes (
  id          uuid primary key default gen_random_uuid(),
  version     text not null,
  deployed_at timestamptz not null default now(),
  title       text not null,
  summary     text,
  changes     text[] not null default '{}',
  tags        text[] not null default '{}',
  deployed_by text
);
create index idx_release_notes_version on public.release_notes (version);
create index idx_release_notes_deployed_at on public.release_notes (deployed_at desc);

-- ── parcours : parcours multi-discipline + inscriptions ────────
create table public.parcours (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  emoji                 text not null default '🎯',
  description           text,
  subjects              text[] not null default '{}',
  questions_per_subject integer not null default 5,
  created_at            timestamptz default now()
);

create table public.parcours_enrollments (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references public.students(id) on delete cascade,
  parcours_id uuid references public.parcours(id) on delete cascade,
  enrolled_at timestamptz default now(),
  unique (student_id, parcours_id)
);

-- ── RLS (identique à la prod) ──────────────────────────────────
alter table public.students             enable row level security;
alter table public.profiles             enable row level security;
alter table public.scores               enable row level security;
alter table public.badges               enable row level security;
alter table public.quiz_answers         enable row level security;
alter table public.keyboard_progress    enable row level security;
alter table public.parcours             enable row level security;
alter table public.parcours_enrollments enable row level security;
-- questions et release_notes : RLS désactivé en prod

create policy "parent voit ses eleves" on public.students
  for all using (auth.uid() = parent_id) with check (auth.uid() = parent_id);

create policy anon_all_profiles on public.profiles          for all to anon using (true) with check (true);
create policy anon_all_scores   on public.scores            for all to anon using (true) with check (true);
create policy anon_all_badges   on public.badges            for all to anon using (true) with check (true);
create policy anon_all_quiz     on public.quiz_answers      for all to anon using (true) with check (true);
create policy anon_all_keyboard on public.keyboard_progress for all to anon using (true) with check (true);

create policy parcours_select_all     on public.parcours for select using (true);
create policy parcours_insert_service on public.parcours for insert with check (true);
create policy parcours_update_service on public.parcours for update using (true);
create policy parcours_delete_service on public.parcours for delete using (true);

create policy enrollments_select_all     on public.parcours_enrollments for select using (true);
create policy enrollments_insert_service on public.parcours_enrollments for insert with check (true);
create policy enrollments_delete_service on public.parcours_enrollments for delete using (true);
