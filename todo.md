# TODO — Play Perform

Fichier unique de pilotage : **en cours**, **backlog** et **bugs connus** (remplace `in-progress.md` et `knownBugs.md`). Supprimer les lignes une fois réalisées ; l'état du projet est dans `README.md`.

## En cours — Landing visiteur + monolithe modulaire (POC)
 Nouveau code en anglais, textes UI en français. Approche « strangler » : `src/modules/` à côté de l'existant, anciens `lib/*` = ré-exports. Modes primaires (lecture, clavier, mots) hors modules. POC : données mockées / seed local.

**Règle produit : l'XP est au compte ; le niveau d'avancement (1 → 5) est par compétence et par élève** (`skills/application/skill-progress.ts`, clé `pp:skill-levels:<profileId>`). Le niveau déduit de l'XP s'appelle « Rang ».

- [ ] Étape 2 — Architecture modulaire : shared, `eslint-plugin-boundaries`, spaced-repetition, rewards, quizzes, contrats
- [ ] Étape 3 — Modèle de données skills + seed, **persistance BDD des niveaux par compétence**
- [ ] Étape 4 — Landing : constellation, célébrations + XP via `rewards`, badge « Premier pas »
- [ ] Brancher `advanceSkillLevel` / `setSkillLevel` (résultat du test de niveau, fin de palier) dans les parcours connectés

## Release, abonnements, déploiement
- [ ] **Appliquer en prod `20260928000000_reading_mode` et `20261008000000_profiles_extra_columns`** (`pricing_plans` appliquée le 2026-10-07) : la table `pricing_plans` n'existe pas sur le Supabase de prod, donc la section « Nos abonnements » et `/admin/pricing` y sont vides/masqués
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
- feature en tant que joueur sur une compétence j'ai une espece de barre d'avancement avec mon niveau actuel vs niveau de maitrise(5)
- tableau de board du jouer avec une carte ludique sur les compétence dans son programme sous forme d'un chateau ou ville avec infra, au click sur une compétence il visualise son niveau actuel  + une synthese sur les revisions passés et à venir avec objectif de date  

## Backlog — Futur
- [ ] Compétition live (strike entre joueurs, récompenses supervisées) et classement
- [ ] Dashboard parent avec suivi de chaque élève
- [ ] Export portfolio de compétences d'un élève
- c'est un SAAS de centre de formation pour vendre le modele en tant que franchise

## Bugs connus (supprimer une fois corrigé)
_Aucun bug ouvert._ (profiles/scores, `/api/releases` et hydration `/mots` `/keyboard` corrigés, à livrer en 0.7.1 ; la migration `20261008000000_profiles_extra_columns` reste à appliquer en prod.)
