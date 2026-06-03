# CLAUDE.md —   Play Perform

Instructions pour Claude Code dans ce repo.


## Règles de code impératives
1. **150 lignes max par fichier** — extraire en sous-composant si dépassé
2. **TypeScript strict** — `any` interdit, tout typer dans `src/types/`
3. **TDD** — tests avant implémentation pour les hooks complexes
4. **Lire `in-progress.md`** avant tout code — lire `README.md` pour l'état actuel — consulter `code-index.md` pour localiser rapidement un fichier ou une fonction
5. **Mettre à jour `README.md`, `todo.md`, `in-progress.md`, `code-index.md`** à la fin de chaque Epic

## Versionnement (SemVer)
- **PATCH** (0.x.Y) : bug fix ou correction mineure
- **MINOR** (0.X.0) : nouvelle fonctionnalité rétro-compatible
- **MAJOR** (X.0.0) : changement structurel majeur ou rupture API
- Version dans `package.json` — source de vérité unique
- **Avant chaque déploiement** : bumper la version dans `package.json`
- **Après chaque déploiement** : exécuter `npm run release -- --title "..." --changes "A,B,C"`
  pour insérer une ligne dans la table `release_notes` Supabase (visible sur `/releases`)
- faire un git add . puis git commit -m "message" et git push origin main


## Index des fichiers .md

| Fichier | Rôle | Mise à jour |
|---|---|---|
| `CLAUDE.md` | Instructions Claude Code — règles, stack, composants, versionnement | Fin de chaque Epic |
| `README.md` | État actuel du projet, routes, architecture | Fin de chaque Epic |
| `in-progress.md` | Epic en cours — lire AVANT de coder, noter ce qui est fait | En continu |
| `todo.md` | Roadmap et backlog priorisé | Fin de chaque Epic |
| `code-index.md` | Index de tous les fichiers, exports, hooks, types, flux de données | **Chaque session** |
| `docs/business-plan.md` | Plan business Play Perform | Si la stratégie change |
| `knownBugs.md` | Bugs connus, workarounds, issues ouvertes | Au fur et à mesure |

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
- Supabase (Auth + DB) · localStorage (scores + progression SRS)

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
 
```

#  Play Perform — Rôles Agentiques

Ce fichier est la Source of Truth pour tout agent qui interagit avec ce repo.
Jamais de code sans lire `in-progress.md` d'abord. Jamais de modification sans mettre à jour `README.md`, `todo.md` et `in-progress.md`.

## Agent RESP (Responsable)
- Lit et écrit `todo.md` (roadmap d'intentions)
- Décide quelle Epic démarrer
- Crée / met à jour `in-progress.md` avec le maximum de contexte
- Vérifie que le `README.md` reflète la vérité du repo à tout moment
- Peut déléguer le code à l'Agent CODEUR
- NE CODE PAS directement sauf si pas d'autre agent dispo

## Agent CODEUR (Exécutant)
- LIT IMPERATIVEMENT `in-progress.md` avant toute ligne de code
- LIT `README.md` pour comprendre l'état actuel du système
- CONSULTE `code-index.md` pour localiser les fichiers, signatures et flux avant de toucher au code
- Code les tâches décrites dans `in-progress.md`
- Respecte la contrainte 150 lignes/fichier
- Respecte TypeScript strict, pas de `any`
- Met à jour `README.md` et `code-index.md` à la fin de chaque Epic pour refléter les changements
- Marque les tâches `in-progress.md` comme terminées au fur et à mesure
- Peut signaler un blocage dans `in-progress.md` pour transfert à un autre agent

## Règles de mise à jour des fichiers
`README.md` : mis à jour à chaque fin d'Epic pour refléter l'état tech + features
`todo.md` : le RESP gère, ajoute/modifie des intentions, repriorise
`in-progress.md` : vivant, mis à jour en continu, effacé quand l'Epic est finie
