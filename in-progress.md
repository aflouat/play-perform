# IN PROGRESS — Patch : Suspense boundary /auth (v0.5.1)

## Statut : TERMINÉ ✅ (2026-05-31)

## Problème corrigé

**Erreur build Vercel** :
```
⨯ useSearchParams() should be wrapped in a suspense boundary at page "/auth"
```

**Cause** : `AuthPage` (le composant page exporté) appelait directement `useSearchParams()`, 
et `AuthForm` (sous-composant) aussi. Next.js exige que tout `useSearchParams()` soit dans un `<Suspense>`.

**Double bug** : `AuthPage` et `AuthForm` avaient chacun leur propre `screen` state — les boutons 
"Pas encore de compte ?" dans `AuthPage` ne synchronisaient pas l'état de `AuthForm`.

## Solution

- Renommé `AuthForm` → `AuthContent` — unique composant avec tout le state + `useSearchParams`
- `AuthPage` devient un wrapper layout pur + `<Suspense><AuthContent /></Suspense>`
- Les boutons toggle "Se connecter / S'inscrire" intégrés dans `AuthContent` (state unifié)
- 143 lignes (< 150)

## Fichiers modifiés

- `src/app/auth/page.tsx` — refactorisé (Suspense + state unifié)
- `package.json` — version 0.5.0 → 0.5.1
