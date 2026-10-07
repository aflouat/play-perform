-- =============================================================
-- 008 — seed_demo_students
-- Insère les 3 élèves de démonstration : Élève démo · Quiz, · Mots, · Clavier
-- associés au compte parent indiqué dans v_email.
--
-- Idempotent : ne recrée pas un élève si son nom existe déjà
-- pour ce parent.
--
-- Exécuter dans : Supabase Dashboard → SQL Editor
-- (le SQL Editor tourne sous le rôle service_role → RLS bypassé)
--
-- Si l'email du parent est différent, remplacer la valeur
-- de v_email ci-dessous.
-- =============================================================

DO $$
DECLARE
  v_email  text    := 'parent@example.com'; -- à remplacer
  v_parent uuid;
BEGIN

  -- Résoudre l'UUID du compte parent
  SELECT id INTO v_parent
  FROM   auth.users
  WHERE  email = v_email
  LIMIT  1;

  IF v_parent IS NULL THEN
    RAISE EXCEPTION
      'Aucun compte trouvé pour l''email %. '
      'Créez d''abord le compte parent via /auth puis relancez ce script.',
      v_email;
  END IF;

  -- ── Élève démo · Quiz — 12 ans, quiz brevet, mode avancé ──────────────
  INSERT INTO students
    (parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode)
  SELECT
    v_parent,
    'Élève démo · Quiz',
    '🧑‍🎓',
    'from-sky-400 to-blue-500',
    '6ème',
    'Objectif : brevet',
    12,
    'quiz',
    'advanced'
  WHERE NOT EXISTS (
    SELECT 1 FROM students
    WHERE  parent_id = v_parent AND name = 'Élève démo · Quiz'
  );

  -- ── Élève démo · Mots — 9 ans, mots FR/EN/ES, mode assisté ───────────
  INSERT INTO students
    (parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode)
  SELECT
    v_parent,
    'Élève démo · Mots',
    '🌸',
    'from-pink-400 to-rose-500',
    'CP adapté',
    'Mots & phrases',
    9,
    'words',
    'assisted'
  WHERE NOT EXISTS (
    SELECT 1 FROM students
    WHERE  parent_id = v_parent AND name = 'Élève démo · Mots'
  );

  -- ── Élève démo · Clavier — 6 ans, clavier, mode assisté ───────────────
  INSERT INTO students
    (parent_id, name, emoji, gradient, grade, tagline, age, mode, learning_mode)
  SELECT
    v_parent,
    'Élève démo · Clavier',
    '🚀',
    'from-emerald-400 to-teal-500',
    'CP',
    'Apprends le clavier !',
    6,
    'keyboard',
    'assisted'
  WHERE NOT EXISTS (
    SELECT 1 FROM students
    WHERE  parent_id = v_parent AND name = 'Élève démo · Clavier'
  );

  RAISE NOTICE 'Seed terminé — parent: % (id: %)', v_email, v_parent;

END $$;

-- Vérification : affiche les élèves insérés
SELECT
  id,
  name,
  emoji,
  grade,
  mode,
  learning_mode,
  age,
  created_at
FROM   students
ORDER  BY age DESC;
