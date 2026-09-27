le fichier est un memo des bugs users, chaque bugs corrigé doit etre supprimé

- **Table `profiles` sans colonnes `gradient`, `tagline`, `age`** : `/api/students` (POST/PATCH) les envoie dans l'upsert → l'upsert échoue silencieusement (`Promise.allSettled`) → pas de ligne `profiles`, donc l'upsert `scores` (FK) échoue aussi. Constaté en prod et reproduit en local.
- **`/api/releases` ne lit jamais la BDD** : `fetchReleaseNotes` utilise `getClient()` (null côté serveur) → retombe toujours sur les notes statiques.
