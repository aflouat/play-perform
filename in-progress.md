# IN PROGRESS — v0.5.6 : admin link, CSV template, Anki review, SRS date

## Statut : ✅ COMPLÉTÉ

### Réalisé

**Bug 1** — Date prochaine révision sur l'écran "tout révisé"
- ✅ `loadProgressMap` utilisé pour calculer la date min de `nextReview`
- ✅ Affichage "Prochaine révision : jeudi 5 juin" en violet

**Feature A** — Lien admin visible pour les admins
- ✅ `/api/is-admin` route créée (GET → `{ isAdmin: boolean }`)
- ✅ `page.tsx` : appel après auth, lien "⚙️ Admin" dans le footer si isAdmin=true

**Feature B** — Template CSV téléchargeable
- ✅ Bouton "⬇ Télécharger le modèle CSV" sur `/admin/import`
- ✅ CSV inclut en-têtes, règles commentées et 2 lignes d'exemple

**Feature C** — Mode révision Anki post-quiz
- ✅ `AnkiReviewSession.tsx` : re-pose les questions ratées en boucle jusqu'à toutes correctes
- ✅ `QuizResultScreen` : bouton "🔁 Réviser les X erreurs" si wrongAnswers > 0
- ✅ `quiz/[subject]/page.tsx` : état `ankiQuestions`, bascule sur AnkiReviewSession

### Vérifications
- `npm run test` : 62/62 verts ✅
- `npm run build` : succès, 0 erreur TypeScript ✅
- Version bumped : 0.5.4 → 0.5.6 ✅
