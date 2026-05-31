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

---

## Variables d'environnement requises

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase (client + serveur) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (client-side uniquement) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role — **serveur uniquement**, jamais exposée côté client |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'app (ex: `https://play-perform.vercel.app`) |
