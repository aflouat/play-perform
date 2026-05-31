# IN PROGRESS — Refactoring + stabilisation (v0.5.1)

## Statut : EN COURS

## Ce qui a été fait dans cette passe

### Bug fixes
- API /api/students fonctionne sans `SUPABASE_SERVICE_ROLE_KEY` : fallback anon key + user JWT (Authorization header)
- Fallback insert students sans colonnes mode/learning_mode (migration 007b non appliquée)
- Auto-seed : tous les comptes parent avec 0 élèves reçoivent les 3 profils par défaut (plus limité à aflouat@gmail.com)

### Refactoring (règle 150 lignes)
- `src/app/page.tsx` : 192 → 120 lignes (extraction ModeSheet + LandingScreen)
- `src/components/shared/ModeSheet.tsx` : nouveau composant (bottom sheet mode selector)
- `src/components/shared/LandingScreen.tsx` : nouveau composant (page d'accueil non-auth)
- `src/types/index.ts` : 202 → 120 lignes (compactage, tous les types préservés)

### MD mis à jour
- `README.md` : état v0.5.1, architecture complète, variables d'env
- `todo.md` : repriorisation, livraisons marquées ✅
- `in-progress.md` : ce fichier
- `knownBugs.md` : bug ajout élève (en cours de résolution via fallback API)

## Fichiers créés / modifiés

- `src/app/api/students/route.ts` — fallback sans service role key
- `src/app/api/students/[id]/route.ts` — fallback sans service role key
- `src/components/shared/ModeSheet.tsx` — NEW
- `src/components/shared/LandingScreen.tsx` — NEW
- `src/app/page.tsx` — allégé
- `src/types/index.ts` — compacté

## À faire encore

- Appliquer migration 007b en prod (colonnes mode/learning_mode sur students)
- Configurer SUPABASE_SERVICE_ROLE_KEY dans .env.local ET Vercel pour la fiabilité maximale
- Configurer NEXT_PUBLIC_SITE_URL sur Vercel pour les liens d'activation email
