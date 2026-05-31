# Supabase Migrations

SQL à exécuter dans le **Supabase Dashboard → SQL Editor** pour chaque table.  
Exécuter dans l'ordre numéroté. Ne jamais supprimer une table sans migrer les données.

---

## 001 — scores

```sql
create table if not exists scores (
  profile_id text primary key,
  xp integer not null default 0,
  level integer not null default 1,
  streak integer not null default 0,
  last_activity_at timestamptz,
  updated_at timestamptz not null default now()
);
```

## 002 — badges

```sql
create table if not exists badges (
  profile_id text not null,
  badge_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (profile_id, badge_id)
);
```

## 003 — quiz_answers

```sql
create table if not exists quiz_answers (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  subject text not null,
  question_id text not null,
  is_correct boolean not null,
  xp_earned integer not null default 0,
  answered_at timestamptz not null default now()
);
```

## 004 — keyboard_progress

```sql
create table if not exists keyboard_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null,
  mode text not null,
  level integer not null,
  score integer not null,
  total integer not null,
  logged_at timestamptz not null default now()
);
```

## 005 — questions (import admin)

```sql
create table if not exists questions (
  id text primary key,
  subject text not null,
  category text,
  difficulty smallint not null check (difficulty between 1 and 4),
  xp_reward smallint not null,
  emoji text,
  image_url text,
  question text not null,
  question_assisted text,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  option_a_assisted text,
  option_b_assisted text,
  option_c_assisted text,
  option_d_assisted text,
  correct_option_id text not null check (correct_option_id in ('A','B','C','D')),
  explanation text not null,
  explanation_assisted text,
  created_at timestamptz default now()
);
```

## 006 — release_notes

```sql
create table if not exists release_notes (
  id uuid primary key default gen_random_uuid(),
  version text not null,
  deployed_at timestamptz not null default now(),
  title text not null,
  summary text,
  changes text[] not null default '{}',
  tags text[] not null default '{}',
  deployed_by text
);

-- Index pour accélérer les filtres courants
create index if not exists idx_release_notes_version on release_notes(version);
create index if not exists idx_release_notes_deployed_at on release_notes(deployed_at desc);
```

## 007 — students (espace parent)

```sql
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  emoji text not null default '🎓',
  gradient text not null default 'from-sky-400 to-blue-500',
  grade text not null default 'CE1',
  tagline text not null default '',
  age integer not null default 10,
  created_at timestamptz default now()
);

-- RLS : chaque parent ne voit que ses propres élèves
alter table students enable row level security;
create policy "parent voit ses eleves" on students
  for all using (auth.uid() = parent_id)
  with check (auth.uid() = parent_id);
```

## 007b — Colonnes mode/learning_mode sur students

```sql
-- Ajouter après la migration 007
alter table students
  add column if not exists mode text not null default 'quiz'
    check (mode in ('quiz', 'words', 'keyboard')),
  add column if not exists learning_mode text not null default 'advanced'
    check (learning_mode in ('assisted', 'advanced'));

-- Fix: parent_id auto-set depuis le JWT (évite les inserts sans parent_id)
alter table students alter column parent_id set default auth.uid();
```

## 008 — seed_demo_students

Insère les 3 élèves de démonstration liés au compte parent `aflouat@gmail.com`.  
Idempotent (WHERE NOT EXISTS). Fichier source : `migrations/008_seed_demo_students.sql`.

```sql
DO $$
DECLARE
  v_email  text    := 'aflouat@gmail.com';
  v_parent uuid;
BEGIN
  SELECT id INTO v_parent FROM auth.users WHERE email = v_email LIMIT 1;
  IF v_parent IS NULL THEN
    RAISE EXCEPTION 'Aucun compte trouvé pour %. Créez d''abord le compte via /auth.', v_email;
  END IF;

  -- Omar — 12 ans, quiz, advanced
  INSERT INTO students (parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode)
  SELECT v_parent, 'Omar', '🧑‍🎓', 'from-sky-400 to-blue-500', '6ème', 'Objectif : brevet', 12, 'quiz', 'advanced'
  WHERE NOT EXISTS (SELECT 1 FROM students WHERE parent_id = v_parent AND name = 'Omar');

  -- Esma — 9 ans, words, assisted
  INSERT INTO students (parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode)
  SELECT v_parent, 'Esma', '🌸', 'from-pink-400 to-rose-500', 'CP adapté', 'Mots & phrases', 9, 'words', 'assisted'
  WHERE NOT EXISTS (SELECT 1 FROM students WHERE parent_id = v_parent AND name = 'Esma');

  -- Mohamed — 6 ans, keyboard, assisted
  INSERT INTO students (parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode)
  SELECT v_parent, 'Mohamed', '🚀', 'from-emerald-400 to-teal-500', 'CP', 'Apprends le clavier !', 6, 'keyboard', 'assisted'
  WHERE NOT EXISTS (SELECT 1 FROM students WHERE parent_id = v_parent AND name = 'Mohamed');

  RAISE NOTICE 'Seed terminé — parent: % (id: %)', v_email, v_parent;
END $$;
```

---

## Variables d'environnement requises

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (client + serveur) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (client-side uniquement) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role — **serveur uniquement**, jamais exposée côté client |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app (ex: `https://play-perform.vercel.app`) |
