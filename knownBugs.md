le fichier est un memo des bugs users, chaque bugs corrigé doit etre supprimé

1-Si SUPABASE_SERVICE_ROLE_KEY n'est pas dans .env.local, l'ajout d'élèves utilise le fallback anon key.
  Ce fallback fonctionne si la RLS policy est correctement configurée sur la table students.
  Pour une fiabilité maximale, ajouter SUPABASE_SERVICE_ROLE_KEY dans .env.local ET dans les variables Vercel.

2-La migration 007b (colonnes mode/learning_mode sur students) n'est peut-être pas encore appliquée en prod.
  Appliquer depuis Supabase Dashboard → SQL Editor (voir docs/supabase-migrations.md).
