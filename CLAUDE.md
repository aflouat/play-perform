# CLAUDE.md —   Play Perform

Instructions pour Claude Code dans ce repo.

## Personas (agent.md → Cibles)

| Profil | Âge | Besoins | Route |
|---|---|---|---|
| Omar | 12 ans | Quiz brevet, progression rapide | 
| Esma | 9 ans | Troubles d'apprentissage, mots simples FR/EN/ES , tape touche mot ou phrase avec le mode assisté activé par défaut
| Mohamed | 6 ans | Clavier, mots, découverte sciences tape touche mot ou phrase
## Règles de code impératives
1. **150 lignes max par fichier** — extraire en sous-composant si dépassé
2. **TypeScript strict** — `any` interdit, tout typer dans `src/types/`
3. **TDD** — tests avant implémentation pour les hooks complexes
4. **Lire `in-progress.md`** avant tout code — lire `README.md` pour l'état actuel
5. **Mettre à jour `README.md`, `todo.md`, `in-progress.md`** à la fin de chaque Epic

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
| `README.md` | État actuel du projet, routes, architecture | Fin de chaque Epic | ?
| `in-progress.md` | Epic en cours — lire AVANT de coder, noter ce qui est fait | En continu |
| `todo.md` | Roadmap et backlog priorisé | Fin de chaque Epic |
| `docs/business-plan.md` | Plan business  Play Perform | Si la stratégie change |
| `knownBugs.md` | Bugs connus, workarounds, issues ouvertes | Au fur et à mesure |

## Stack
- Next.js 16.2.6 App Router · TypeScript strict · Tailwind v4
- Jest 30 + @testing-library/react + Playwright

## Audio
- `playSound(type)` — Web Audio API (correct/wrong/levelup/complete/click)
- `speakText(text, lang)` — TTS sobre
- `speakEnthusiastic(word, lang)` — TTS enthousiaste avec interjection aléatoire
- `speakInstruction(text, lang)` — TTS instruction claire

## Score visible
- `XpGainToast` + `useXpGain` — badge "+N XP" flottant animé
- CSS : `.xp-float`, `.score-pop`, `.level-up` dans `globals.css`

## Composants Mohamed
- `LetterMode` — une lettre à la fois (clavier physique + tap)
- `WordMode` — mot entier lettre par lettre (clavier physique)
- `ScienceMode` — QCM sciences pour 6 ans

## Commandes
```bash
npm run dev           # Dev server
npm run test          # Tests unit + intégration
npm run test:e2e      # E2E Playwright
npm run build         # Build prod
npm run release -- --title "Titre" --changes "A,B,C" [--tags "feature,fix"] [--summary "..."]
                      # Insère une release note dans Supabase après déploiement
Apres chaque release, il faut faire un commit et push origin main
```
