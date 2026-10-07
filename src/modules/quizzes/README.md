# Module `quizzes` (version minimale)

**Responsabilité** : quiz et banque de questions. Pour le POC : **tests de positionnement** (1 question par niveau 1 → 5).

## API publique (`index.ts`)
- `getPlacementTest(skillId)` → 5 questions triées par niveau
- `scoreAnswer(question, chosenIndex | null)` — `null` = « Je ne sais pas »
- `estimateStartLevel(answers)` → `{ startLevel, correct, skipped, total, mastered }` — niveau de départ = 1 + bonnes réponses (max 5)
- Types : `PlacementQuestion`, `PlacementAnswer`, `PlacementResult`, `PlacementLevel`

## Structure
- `domain/placement.ts` — règles pures
- `infra/placement-bank-{a,b}.ts` — 40 questions (8 compétences × 5 niveaux), reliées aux compétences par `skillId`

Ne dépend d'aucun autre module. Les quiz par matière existants (`src/lib/question-banks`) y seront migrés plus tard.
