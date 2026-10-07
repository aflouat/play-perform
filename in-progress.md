# IN PROGRESS — Landing visiteur + monolithe modulaire (POC)

Branche : `feat/landing-modules` · Pilotage par étapes, « go » utilisateur entre chaque étape.

## Décisions (Étape 0, validées)
- Approche « strangler » : `src/modules/` + `src/shared/` créés à côté de l'existant ; les anciens `lib/*` deviennent des ré-exports
- Lint des frontières : `eslint-plugin-boundaries` (règle index-only + couches domain / application / infra / ui)
- Constellation : coordonnées fixes dans le seed (pas de d3-force pour 8-12 étoiles)
- Types métier dans `modules/*/domain`, types communs dans `src/shared/types`, `src/types` = legacy
- Nouveau code et commentaires en anglais, textes UI en français ; pas de traduction de l'existant
- Modes primaire (lecture, clavier, mots) laissés hors modules pour cette itération
- POC : données mockées / seed local, aucun nouveau backend

## Étapes
- [x] Étape 0 — Audit
- [x] Étape 1 — Nettoyage des prénoms + check automatisé (`npm run check:names`, test Jest)
- [ ] Étape 2 — Architecture modulaire (shared, boundaries, spaced-repetition, rewards, quizzes, contrats)
- [ ] Étape 3 — Modèle de données skills + seed
- [ ] Étape 4 — Page d'accueil visiteur (**v1 livrée** : mode sans/avec compte, choix compétence, test de niveau, résultat 1→5, section parents ; reste : constellation, célébrations + XP via `rewards`, badge « Premier pas »)

## Notes Étape 1
- Route `/esma` → `/mots` (pas de redirection : elle aurait gardé le prénom dans le dépôt)
- Profils statiques : ids `demo-quiz`, `demo-words`, `demo-keyboard` (progression locale des anciens ids perdue)
- `LICENSE` et `package-lock.json` exclus du check (titulaire du copyright)
- Base locale : `npm run db:reset` pour appliquer les nouveaux libellés du seed
- Base de prod : les élèves déjà créés gardent leurs prénoms (données, pas dépôt) — non modifiés
- Historique git non réécrit

## Notes page d'accueil (v1, faite avant l'Étape 2 à la demande)
- Modules `landing`, `skills`, `quizzes` créés dans la structure cible (index-only), sans lint de frontières ni bus d'événements (Étape 2)
- `LandingScreen.tsx` supprimé, remplacé par `LandingPage` sur `/` pour les visiteurs non connectés
- Check des prénoms (script + test) retiré côté utilisateur

## Release git + tarifs + plan de déploiement
- [x] `scripts/release-tag.mjs` (`npm run release:tag`) : semver, notes groupées, CHANGELOG, commit + tag annoté, `--dry-run` / `--push` / `--github` — 8 tests
- [x] Version affichée en bas de page (`AppVersion`, `SiteFooter`)
- [x] Module `pricing` : table `pricing_plans`, API publique + admin, `/admin/pricing`, section « Nos abonnements » — 13 tests
- [x] Plan Vercel + Mac mini : `docs/deploiement.md` (décisions en attente)
- [ ] Tag de référence `v0.7.0` avant la 1re release (sinon la note reprend tout l'historique, qui contient d'anciens prénoms)
- [ ] Vérification visuelle tarifs / admin (Docker arrêté pendant la session)
- [ ] Paiement en ligne (non demandé pour l'instant)
