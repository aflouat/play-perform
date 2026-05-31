# IN PROGRESS — Epic : Sons, Score Animé, Mohamed Complet

## Statut : TERMINÉ ✅ (2026-05-30)

## Ce que cette Epic a produit

### Corrections de bugs
- `esma/page.tsx` : bug hydration corrigé — `getActiveProfileId()` était appelé au render (SSR) sans `useEffect`, causant une erreur localStorage côté serveur. Corrigé avec `useState + useEffect`.

### Sons enthousiastes (src/lib/audio.ts)
- `speakEnthusiastic(word, lang)` : dit d'abord une interjection aléatoire ("Super !", "Bravo !", "Génial !"...) puis le mot — voix pitch 1.3, rate 1.1
- `speakInstruction(text, lang)` : voix claire pour les consignes
- `getBestVoice(lang)` : sélectionne automatiquement la meilleure voix disponible (locale prioritaire)
- Pool d'interjections par langue (FR/EN/ES)

### Score animé visible
- `XpGainToast` + `useXpGain` hook : badge "+N XP" flottant qui apparaît et monte avec fondu
- CSS : `@keyframes xpfloat`, `score-pop`, `level-up` dans globals.css
- Intégré dans quiz Omar, jeu Esma, modes Mohamed

### Mohamed — 3 modes complets
- **LetterMode** : une lettre à la fois, clavier physique + bouton tactile, 4 niveaux
- **WordMode** : mot entier à taper lettre par lettre (CHAT, SOLEIL...), feedback visuel par lettre
- **ScienceMode** : 8 QCM sciences pour 6 ans (gravité, photosynthèse, arc-en-ciel...) avec faits amusants

### Données
- `src/lib/phrase-data.ts` : mots niveau 1 (4 lettres) et niveau 2 (5-6 lettres) pour taper
- `src/lib/science-data.ts` : 8 questions sciences illustrées avec explication et fait bonus

### Fichiers .md consolidés
- `README.md` : état complet du système
- `CLAUDE.md` : instructions agentiques à jour
- `todo.md` : roadmap priorisée
- `in-progress.md` : ce fichier

## Fichiers créés / modifiés
- `src/lib/audio.ts` — sons enthousiastes
- `src/lib/phrase-data.ts` — mots à taper (NEW)
- `src/lib/science-data.ts` — questions sciences (NEW)
- `src/components/ui/XpGainToast.tsx` — animation XP (NEW)
- `src/components/keyboard/LetterMode.tsx` — mode lettres (NEW)
- `src/components/keyboard/WordMode.tsx` — mode mots (NEW)
- `src/components/keyboard/ScienceMode.tsx` — mode sciences (NEW)
- `src/app/keyboard/page.tsx` — 3 modes avec onglets
- `src/app/esma/page.tsx` — bug hydration corrigé + score animé
- `src/app/quiz/[subject]/page.tsx` — XpGainToast + speakEnthusiastic
- `src/app/globals.css` — animations CSS
