# TODO — Play Perform

Fichier unique de pilotage : **en cours**, **backlog** et **bugs connus** (remplace `in-progress.md` et `knownBugs.md`). Supprimer les lignes une fois réalisées ; l'état du projet est dans `README.md`.

## En cours — Landing visiteur + monolithe modulaire (POC)
Branche `feat/landing-modules`. Nouveau code en anglais, textes UI en français. Approche « strangler » : `src/modules/` à côté de l'existant, anciens `lib/*` = ré-exports. Modes primaires (lecture, clavier, mots) hors modules. POC : données mockées / seed local.

**Règle produit : l'XP est au compte ; le niveau d'avancement (1 → 5) est par compétence et par élève** (`skills/application/skill-progress.ts`, clé `pp:skill-levels:<profileId>`). Le niveau déduit de l'XP s'appelle « Rang ».

- [ ] Étape 2 — Architecture modulaire : shared, `eslint-plugin-boundaries`, spaced-repetition, rewards, quizzes, contrats
- [ ] Étape 3 — Modèle de données skills + seed, **persistance BDD des niveaux par compétence**
- [ ] Étape 4 — Landing : constellation, célébrations + XP via `rewards`, badge « Premier pas »
- [ ] Brancher `advanceSkillLevel` / `setSkillLevel` (résultat du test de niveau, fin de palier) dans les parcours connectés

## Release, abonnements, déploiement
- [ ] **Appliquer en prod les migrations `20260928000000_reading_mode` et `20261007000000_pricing_plans`** : la table `pricing_plans` n'existe pas sur le Supabase de prod, donc la section « Nos abonnements » et `/admin/pricing` y sont vides/masqués
- [ ] **Emails d'inscription prod** : SMTP perso dans Supabase (Auth → SMTP) — le SMTP par défaut est limité (~2 mails/h, membres de l'équipe seulement) ; vérifier `NEXT_PUBLIC_SITE_URL` sur Vercel. Voir `docs/deploiement.md`
- [ ] Prod : activer RLS sur `questions` et `release_notes` (alerte sécurité Supabase) avec les policies adaptées
- [ ] Configurer env vars prod (`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAILS`)
- [ ] Tag de référence `v0.7.0` avant la 1re release (sinon la note reprend tout l'historique)
- [ ] Vérification visuelle tarifs / admin (Docker arrêté)
- [ ] Paiement en ligne (non demandé pour l'instant)

## Backlog — Contenu
- [ ] Lecture syllabique v0.7.x : Assembler, Compter, niveaux 3-4, estompage, SRS, import CSV mots, audio enregistré
- [ ] Plus de mots pour le niveau initié (8 par langue → 30+)
- [ ] Phrases simples pour le mode assisté (pas seulement mots isolés)
- [ ] Niveaux 3-4 : mots à taper pour le niveau initié

## Backlog — Admin / Qualité
- [ ] Admin : liste des élèves avec suivi de progression
- [ ] Revue façon Anki après chaque quiz avec erreur ; SRS : intervalle × facteur de facilité (réussite parfaite ×2-3, lacunes → 1 jour)
- [ ] Streak quotidien visible sur la page d'accueil
- [ ] Tests e2e Playwright à jour

## Backlog — Futur
- [ ] Compétition live (strike entre joueurs, récompenses supervisées) et classement
- [ ] Dashboard parent avec suivi de chaque élève
- [ ] Export portfolio de compétences d'un élève

## Bugs connus (supprimer une fois corrigé)
- **Table `profiles` sans colonnes `gradient`, `tagline`, `age`** : `/api/students` (POST/PATCH) les envoie dans l'upsert → l'upsert échoue silencieusement (`Promise.allSettled`) → pas de ligne `profiles`, donc l'upsert `scores` (FK) échoue aussi. Constaté en prod et en local.
- **`/api/releases` ne lit jamais la BDD** : `fetchReleaseNotes` utilise `getClient()` (null côté serveur) → retombe toujours sur les notes statiques.
- **Hydration mismatch sur `/mots` et `/keyboard`** : sessions tirées avec `Math.random()` dans un `useState` initial (serveur ET client). Correctif : ne rendre la session qu'une fois `isProfileReady(profileId)` (comme `/lecture`).
