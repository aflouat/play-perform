# IN PROGRESS — Landing visiteur + monolithe modulaire (POC)

Branche : `feat/landing-modules` · Pilotage par étapes, « go » utilisateur entre chaque étape.

## Décisions
- Approche « strangler » : `src/modules/` + `src/shared/` à côté de l'existant ; anciens `lib/*` = ré-exports
- Lint des frontières : `eslint-plugin-boundaries` (index-only + couches domain / application / infra / ui)
- Nouveau code et commentaires en anglais, textes UI en français
- Modes primaire (lecture, clavier, mots) hors modules pour cette itération
- POC : données mockées / seed local, aucun nouveau backend
- **XP = au compte ; niveau d'avancement = par compétence** (`skills/application/skill-progress.ts`, clé `pp:skill-levels:<profileId>`). Le niveau déduit de l'XP est affiché comme « Rang ».

## Étapes
- [ ] Étape 2 — Architecture modulaire (shared, boundaries, spaced-repetition, rewards, quizzes, contrats)
- [ ] Étape 3 — Modèle de données skills + seed (+ persistance BDD des niveaux par compétence)
- [ ] Étape 4 — Landing : v1 livrée ; reste constellation, célébrations + XP via `rewards`, badge « Premier pas »
- [ ] Brancher `advanceSkillLevel` / `setSkillLevel` (résultat du test de niveau, fin de palier) dans les parcours connectés

## Release / déploiement
- [ ] Tag de référence `v0.7.0` avant la 1re release (sinon la note reprend tout l'historique)
- [ ] Vérification visuelle tarifs / admin (Docker arrêté)
- [ ] **Emails d'inscription prod** : configurer un SMTP perso dans Supabase (Auth → SMTP) — le SMTP par défaut est limité (~2 mails/h, membres de l'équipe seulement). Voir `docs/deploiement.md`
