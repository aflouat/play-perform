# IN PROGRESS — Corrections bugfix (v0.5.4)

## Statut : ✅ COMPLÉTÉ

### Bugs corrigés dans cette passe

**Bug 1** — Prénom affiché correctement sur /home et /quiz
- ✅ Ajout `setActiveProfile(id, meta)` + `getActiveProfileMeta()` dans `profiles.ts`
- ✅ `page.tsx` : `startSession` sauvegarde name/emoji/gradient en localStorage
- ✅ `home/page.tsx` + `quiz/[subject]/page.tsx` : fallback sur `profileMeta.name`

**Bug 2** — Suppression de la modale ModeSheet
- ✅ Clic sur profil → navigation directe sur `homeRoute` sans modal
- ✅ Import ModeSheet et état `selected` supprimés de `page.tsx`

**Bug 3** — SRS corrigé : questions déjà répondues ne reviennent plus avant leur date
- ✅ Suppression du bucket `reviewing` dans `selectQuestions`
- ✅ Bucket `notDueYet` créé, utilisé uniquement en mode bypass ("Continuer quand même")

**Bug 4** — Admin opérationnel sans SUPABASE_SERVICE_ROLE_KEY
- ✅ `isAdminAuthorized` utilise anon key comme fallback pour la vérification JWT

### Vérifications
- `npm run test` : 62/62 verts ✅
- `npm run build` : succès, 0 erreur TypeScript ✅
- Version bumped : 0.5.3 → 0.5.4 ✅
