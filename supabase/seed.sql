-- =============================================================
-- Seed local — exécuté automatiquement par `supabase start` / `db reset`.
-- Données fictives uniquement (aucune donnée de prod).
--
-- Compte parent / admin : demo@playperform.local / demo1234
-- =============================================================

-- ── Compte parent (auth) ───────────────────────────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'demo@playperform.local',
  crypt('demo1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'email',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"demo@playperform.local","email_verified":true}',
  now(), now(), now()
);

-- ── Élèves de démonstration ────────────────────────────────────
insert into public.students (id, parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode) values
  ('22222222-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Élève démo · Quiz', '🧑‍🎓', 'from-sky-400 to-blue-500', '3ème', 'Objectif : brevet', 14, 'quiz', 'advanced'),
  ('22222222-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Élève démo · Mots', '🌸', 'from-pink-400 to-rose-500', 'CE2', 'J''apprends les mots', 8, 'words', 'assisted'),
  ('22222222-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   'Élève démo · Clavier', '🚀', 'from-emerald-400 to-teal-500', 'CP', 'Je découvre le clavier', 6, 'keyboard', 'assisted');

insert into public.profiles (id, name, emoji, grade, mode)
select id::text, name, emoji, grade, mode from public.students;

insert into public.scores (profile_id, xp, level, streak, last_activity_at)
select id::text, 0, 1, 0, now() from public.students;

-- ── Parcours exemple + inscription ─────────────────────────────
insert into public.parcours (id, name, emoji, description, subjects, questions_per_subject) values
  ('33333333-0000-0000-0000-000000000001', 'Révisions brevet', '🎯',
   'Un tour rapide des matières du brevet', array['maths', 'francais', 'histoire'], 5);

insert into public.parcours_enrollments (student_id, parcours_id) values
  ('22222222-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001');

-- ── Release note locale ────────────────────────────────────────
insert into public.release_notes (version, title, summary, changes, tags, deployed_by) values
  ('0.6.0', 'Environnement local', 'Base Supabase locale via Docker',
   array['Supabase local', 'Seed de démonstration'], array['dev'], 'seed');
