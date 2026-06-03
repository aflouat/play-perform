# IN PROGRESS — v0.6.0 : Indices assistés + Parcours multi-discipline

## Statut : ✅ COMPLÉTÉ

### Réalisé

**Feature A — 20 questions supplémentaires avec indices**
- ✅ `src/types/index.ts` : champ `hint?: string` ajouté à `QuizQuestion`
- ✅ `src/lib/question-banks/hints-questions.ts` : 20 questions réparties sur 4 matières (maths, français, histoire, SVT), chacune avec un indice textuel pédagogique
- ✅ Importées dans `index.ts` — s'ajoutent aux banques existantes

**Feature B — Affichage de l'indice en mode assisté**
- ✅ `useQuizCard.ts` : si `question.hint` existe, on parle l'indice (TTS) + affiche son texte. Sinon, fallback sur l'élimination d'une mauvaise réponse (comportement précédent)
- ✅ `QuizCard.tsx` : panneau 💡 affiche le texte de l'indice au lieu du message générique

**Feature C — Système de Parcours multi-discipline**
- ✅ Migration Supabase : tables `parcours` + `parcours_enrollments` créées (RLS activé)
- ✅ Types `Parcours`, `ParcoursEnrollment` dans `src/types/index.ts`
- ✅ `src/lib/db/parcours.ts` : CRUD complet (fetchAll, fetchById, insert, update, delete, enroll, unenroll)
- ✅ API routes : `/api/parcours`, `/api/parcours/[id]`, `/api/parcours/[id]/enroll`, `/api/parcours/student/[studentId]`
- ✅ Admin nav : lien "🗺️ Parcours" dans le layout admin
- ✅ `/admin/parcours` : liste des parcours + formulaire création + boutons Inscrire/Modifier/Supprimer
- ✅ `/admin/parcours/[id]` : édition du parcours + gestion des inscriptions
- ✅ `EnrollModal.tsx` : modal avec toggle inscription par élève
- ✅ `ParcoursForm.tsx` : formulaire sélection matières, emoji, nom, questions/matière

**Feature D — Jeu Parcours côté élève**
- ✅ `ParcoursCard.tsx` : carte parcours sur la home (si inscrit)
- ✅ `ParcoursSession.tsx` : session multi-sujets avec transition animée entre matières, barre de progression, écran de fin avec scores par matière
- ✅ `/parcours/[id]` : écran d'intro avec liste des matières + XP max, bouton démarrer
- ✅ `home/page.tsx` : section "🗺️ Mes parcours" si l'élève a des inscriptions

### Vérifications
- `npm run test` : 62/62 verts ✅
- `npm run build` : 0 erreur TypeScript ✅
- Version : 0.5.6 → 0.6.0 ✅
