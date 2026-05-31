# IN PROGRESS — Audit & refacto qualité (v0.5.1)

## Statut : EN COURS

## Ce qui a été fait dans cette passe

### Lint vert (29 erreurs + 11 warnings → 0)
- Pattern **key-remount** (React 19) pour le reset d'état par question, supprimant les effets `set-state-in-effect` :
  - `QuizCard` keyé par `question.id` (effet reset supprimé, chrono + TTS au montage)
  - `ScienceMode` scindé → `ScienceQuestionView` keyé par `question.id`
  - `WordMode` scindé → `WordTypingView` keyé par `word.id`
  - `LetterMode` scindé → `LetterCardView` keyé par `challenge.id` (rechargement de niveau dans un handler, plus un effet)
  - `WordChallenge` (Esma) keyé par `current.target.id` : porte désormais indice + option barrée
- `useActiveProfileId` (nouveau, `useSyncExternalStore`) : lecture SSR-safe du profil, remplace le bloc `useState + useEffect` dupliqué dans quiz/esma/home/keyboard
- Effets de fetch admin/questions : IIFE async (plus de `setState` synchrone)
- `useEngagement` : assignation de ref déplacée en effet, `totalSeconds` dérivé du state (purity)
- 12 apostrophes JSX échappées (`&apos;`), imports/vars inutilisés retirés
- 1 seul `eslint-disable` documenté restant : sélection SRS aléatoire dans `useQuizSession` (Math.random impossible en render)

### Duplication & cohérence
- `src/lib/subjects.ts` (nouveau) : source unique `SUBJECT_META` / `ALL_SUBJECT_IDS` / `NAV_SUBJECTS` + `getSubjectLabel`
- `quiz-data.ts`, `home/page.tsx`, `quiz/[subject]/page.tsx`, `csv-parser.ts`, pages admin : dérivent de `subjects.ts` (fin des 4 copies de la liste des matières et du double `SUBJECT_BG`/`SUBJECT_META`)
- `toSpeechLang()` centralisé dans `word-data.ts` (fin du mapping langue dupliqué)

### Robustesse
- Guard `if (!q) return` dans `useQuizSession.handleAnswer`
- Validation semver de `version` dans l'API POST `/api/releases`

### Nettoyage
- Suppression des 4 dossiers vides : `(zone1)-lab`, `(zone2)-clubs`, `(zone3)-hub`, `dashboard`
- Retrait des dépendances inutilisées `recharts` et `geist`

## Vérifications
- `npm run lint` : 0 erreur, 0 warning
- `npm run test` : 62 tests verts (test obsolète sur props supprimées retiré)
- `npm run build` : succès, 0 erreur TypeScript
- Tous les fichiers `src/` hors tests ≤ 150 lignes

## À faire encore (hérité)
- Appliquer migration 007b en prod (colonnes mode/learning_mode sur students)
- Configurer SUPABASE_SERVICE_ROLE_KEY dans .env.local ET Vercel
- Configurer NEXT_PUBLIC_SITE_URL sur Vercel pour les liens d'activation email
