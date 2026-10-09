# Changelog

Toutes les versions de Play Perform (générées par `npm run release:tag`).

## v0.11.0 — 2026-10-09

### ✨ Nouveautés
- première connexion guidée en 3 étapes (profil, test de niveau, premier quiz) (f465fdd)
- binômes de la semaine, fil des réussites avec Bravo, mur des trophées, modération par le centre (86f2149)
- mur des pièges classiques sur la page d'une compétence (8c3cc6d)
- échec constructif (« Presque ! »), statistiques anonymes et pièges classiques (2dd2cd8)
- pseudo + prénom/nom, quiz libres, formation complète à inscription auto-validée, diplôme imprimable, un seul menu côté centre (22291f3)
- tableaux de bord du centre, de l'examinateur et accueil apprenant (b255d68)
- menu d'administration par rôle, pages communes réservées à la société mère, isAdminAuthorized aligné sur platform_admins (f45b600)
- portail d'entrée B2C/B2B, coin centre séparé, inscription d'un centre par dossier (SIREN, SIRET, adresse) (68a556d)
- espaces séparés apprenant / centre de formation, fiche légale du centre (SIREN, SIRET, adresse) (335349a)
- classement par pseudos, défi hebdomadaire, médailles automatiques retirables (ee02aae)
- revue des réponses du test de niveau sans compte (feedback question par question) (b6ab856)

### 🐛 Corrections
- un seul menu côté centre (en-tête épuré, barre d'administration unique, plus de pastilles en double) (032825d)

### 📝 Documentation
- règle « pas de nouveau .md » dans CLAUDE.md, fusion des notes franchise et B2C/B2B dans le README (93215ab)

## v0.10.0 — 2026-10-09

### ✨ Nouveautés
- synchro XP/badges via API, accès anonymes limités à la société mère (migration), catalogue commun acté (1356370)
- organisations (société mère + centres), rôles responsable / enseignant / examinateur, permissions par centre (a96ed9f)
- rappels quotidiens par Web Push, application fermée (abonnements, dispatch planifié) (c548124)

### 🐛 Corrections
- message explicite si SUPABASE_SERVICE_ROLE_KEY manque, GET /api/health (eee9680)

### 🔧 Autres changements
- divers ameliorations (90338a5)

## v0.9.0 — 2026-10-08

### ✨ Nouveautés
- effort quotidien jusqu'à la victoire, rappels quotidiens (heure + objectif) (5934716)
- fiche du cours et demande d'inscription (motivations) validée par le centre de formation (9c50d2a)
- accès apprenant par code (jeton signé), authentification enseignant/apprenant des API (fc4b132)
- en-tête et pied de page sur toutes les pages, espace parent → espace enseignant (b7045a4)

### 📝 Documentation
- rôles enseignant/apprenant, inscriptions aux cours, plan de travail et rappels (README, FAQ, index, todo) (e8181f9)

## v0.8.0 — 2026-10-08

### ✨ Nouveautés
- plus d'élèves démo d'office, page confidentialité, FAQ à jour (1909754)
- ville des compétences, barre vers la maîtrise, révisions passées/à venir, objectif de date (b54e4a1)
- compétence Claude Platform, niveaux persistés en base, reprise du test visiteur (b527118)
- évaluation rédigée corrigée par un examinateur, /admin/evaluations, FAQ et docs (c141c6c)
- niveau par compétence visible avant action (quiz, flashcards) — /competences (6dcfc7a)
- streak quotidien calculé, affiché et badges 3/7 jours (d85f868)
- release:tag persiste la note de version (fichier généré, README, base) (3660514)
- niveau par compétence, XP au compte; ménage des .md (07f65d1)

### 🐛 Corrections
- titre de note « Version X » et résumé des nouveautés (7ac62a5)
- profiles/scores à la création d'élève, /api/releases lit la BDD, hydration /mots /keyboard (5201749)

### 📝 Documentation
- migrations skill_evaluations et skill_levels appliquées en prod (193a6a4)
- Brevo comme relais SMTP (compose, env, déploiement) (3126459)
- migrations prod appliquées (3684c0f)
- pricing_plans appliquée en prod (5666d7b)

### 🔧 Autres changements
- docs+test: FAQ alignée (test de cohérence), notes 0.6/0.7, fusion todo/in-progress/knownBugs (8355a85)
- features (8b97eb8)
- POC perform & learn (e1d13a7)

