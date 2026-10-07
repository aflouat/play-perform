# Module `landing`

**Responsabilité** : page d'accueil du visiteur non connecté. Compose les autres modules via leur `index.ts`.

## Parcours
1. **Hero** : promesse + CTA « Faire mon test de niveau »
2. **Mode** : sans compte (résultat gardé sur l'appareil) ou avec compte (`/auth`, `/auth?signup=1`)
3. **Compétence** : choix parmi les compétences du module `skills`
4. **Test de positionnement** : 5 questions (niveaux 1 → 5) du module `quizzes`, bouton « Je ne sais pas »
5. **Résultat** : niveau de départ sur le chemin 1 → 5, CTA « Sauvegarder ma progression »
6. Section parents + liens FAQ / Versions

## API publique (`index.ts`)
- `LandingPage` — utilisée par `src/app/page.tsx` quand aucune session n'est ouverte

## Structure
- `application/useLandingFlow.ts` — machine à étapes (testée)
- `infra/placement-storage.ts` — résultats en localStorage (`pp:placements`)
- `ui/*` — Hero, FlowStepper, ModeChoice, SkillPicker, PlacementTest, PlacementResultView, ParentsSection

## Dépendances
`skills` et `quizzes` (via `index.ts` uniquement). À venir : `rewards` (points, badge « Premier pas »), `users` (sauvegarde de la progression anonyme).
