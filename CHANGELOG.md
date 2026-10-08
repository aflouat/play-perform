# Changelog

Toutes les versions de Play Perform (générées par `npm run release:tag`).

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

