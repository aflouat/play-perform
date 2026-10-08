# CLAUDE.md —   Play Perform

Instructions pour Claude Code dans ce repo.


## Règles de code impératives
1. **150 lignes max par fichier** — extraire en sous-composant si dépassé
2. **TypeScript strict** — `any` interdit, tout typer dans `src/types/`
3. **TDD** — tests avant implémentation pour les hooks complexes
4. **Lire `todo.md`** (section « En cours ») avant tout code — lire `README.md` pour l'état actuel — consulter `code-index.md` pour localiser rapidement un fichier ou une fonction
5. **Mettre à jour `README.md`, `todo.md`, `code-index.md`** à la fin de chaque Epic

## Versionnement (SemVer)
- **PATCH** (0.x.Y) : bug fix ou correction mineure
- **MINOR** (0.X.0) : nouvelle fonctionnalité rétro-compatible
- **MAJOR** (X.0.0) : changement structurel majeur ou rupture API
- Version dans `package.json` — source de vérité unique
- **Avant chaque déploiement** : `npm run release:tag -- patch|minor|major` (ou `x.y.z`) — bump `package.json`, génère la note de version dans `CHANGELOG.md`, commit `chore(release): vX.Y.Z` + tag git annoté (`--dry-run` pour prévisualiser, `--push` pour publier, `--github` pour une Release GitHub via `gh`). La version est affichée en bas de page (`NEXT_PUBLIC_APP_VERSION`)
- **Après chaque déploiement** : exécuter `npm run release -- --title "..." --changes "A,B,C"`
  pour insérer une ligne dans la table `release_notes` Supabase (visible sur `/releases`)
- faire un git add . puis git commit -m "message" et git push origin main


## Index des fichiers .md

| Fichier | Rôle | Mise à jour |
|---|---|---|
| `CLAUDE.md` | Instructions Claude Code — règles, stack, composants, versionnement | Fin de chaque Epic |
| `README.md` | État actuel du projet, routes, architecture | Fin de chaque Epic |
| `todo.md` | Pilotage unique : epic en cours (lire AVANT de coder), backlog priorisé, bugs connus | En continu |
| `code-index.md` | Index de tous les fichiers, exports, hooks, types, flux de données | **Chaque session** |
| `docs/business-plan.md` | Plan business Play Perform | Si la stratégie change |
| `docs/deploiement.md` | Plan Vercel + Mac mini, SMTP | Si l'infra change |

## Règles de maintenance du code-index

1. **Lire `code-index.md`** en début de session — il donne l'état exact du codebase
2. **Mettre à jour `code-index.md`** quand :
   - Un fichier est créé ou supprimé → ajouter/retirer la ligne
   - Un fichier dépasse ou repasse sous 150 lignes → mettre à jour le compteur et le tableau ⚠️
   - Une fonction publique est ajoutée / renommée / supprimée → mettre à jour la signature
   - Un flux de données change → mettre à jour la section "Flux de données clés"
3. **Mettre à jour la date** en en-tête (`_Mis à jour : YYYY-MM-DD · vX.Y.Z_`) à chaque modification

## Stack
- Next.js 16.2.6 App Router · TypeScript strict · Tailwind v4
- Jest 30 + @testing-library/react + Playwright
- Supabase (Auth + DB) — schéma versionné dans `supabase/migrations/`, stack locale via `docker compose up` · localStorage (scores + progression SRS)

## Audio
- `playSound(type)` — Web Audio API (correct/wrong/levelup/complete/click)
- `speakText(text, lang)` — TTS sobre
- `speakEnthusiastic(word, lang)` — TTS enthousiaste avec interjection aléatoire
- `speakInstruction(text, lang)` — TTS instruction claire

## Commandes
```bash
npm run dev           # Dev server
npm run test          # Tests unit + intégration
npm run test:e2e      # E2E Playwright
npm run build         # Build prod
docker compose up -d  # Stack locale : app dev + Supabase (voir README « Développement local »)
npm run db:reset      # Recrée la BDD locale (migrations + seed)
npm run db:migrate    # Applique les nouvelles migrations supabase/migrations/
```

#  Play Perform — Rôles Agentiques

Ce fichier est la Source of Truth pour tout agent qui interagit avec ce repo.
Jamais de code sans lire `todo.md` d'abord. Jamais de modification sans mettre à jour `README.md` et `todo.md`.

## Agent RESP (Responsable)
- Lit et écrit `todo.md` (roadmap, epic en cours, bugs connus)
- Décide quelle Epic démarrer
- Crée / met à jour `todo.md` avec le maximum de contexte
- Vérifie que le `README.md` reflète la vérité du repo à tout moment
- Peut déléguer le code à l'Agent CODEUR
- NE CODE PAS directement sauf si pas d'autre agent dispo

## Agent CODEUR (Exécutant)
- LIT IMPERATIVEMENT `todo.md` avant toute ligne de code
- LIT `README.md` pour comprendre l'état actuel du système
- CONSULTE `code-index.md` pour localiser les fichiers, signatures et flux avant de toucher au code
- Code les tâches décrites dans `todo.md`
- Respecte la contrainte 150 lignes/fichier
- Respecte TypeScript strict, pas de `any`
- Met à jour `README.md` et `code-index.md` à la fin de chaque Epic pour refléter les changements
- Marque les tâches `todo.md` comme terminées au fur et à mesure
- Peut signaler un blocage dans `todo.md` pour transfert à un autre agent

## Règles de mise à jour des fichiers
`README.md` : mis à jour à chaque fin d'Epic pour refléter l'état tech + features
`todo.md` : vivant ; le RESP gère les intentions, la section « En cours » est effacée quand l'Epic est finie, les bugs corrigés sont supprimés

le contenu de la page /releases doit etre actualisée et persistée avec le script npm release:tag pour maintenir la release note. 
