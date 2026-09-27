# IN PROGRESS — v0.7.0 : Lecture syllabique 📖

## Statut : ✅ v0.7.0 COMPLÉTÉ (suite v0.7.x ci-dessous)

## Objectif
Apprendre à lire par syllabes : syllabes en couleurs alternées (bleu / rouge), lettres muettes
en gris, arcs sous chaque syllabe. Couplé au mode assisté : image (emoji), lecture vocale
syllabe par syllabe (karaoké), indices.

## Décisions
- Découpage **écrit** (é·co·le) annoté à la main, pas d'algorithme (lettres muettes, graphies complexes)
- Notation : `-` sépare les syllabes, `()` = muet → `'É-co-le'`, `'blan(c)'`, `'pa-ren(ts)'`
- `say?: string[]` : prononciation TTS par syllabe si la voix lit mal la syllabe isolée
- Couleurs : bleu `#1d4ed8`, rouge `#dc2626` (contraste ≥ 4.5:1), muet `#94a3b8` ; arcs = repère non coloré (daltonisme)
- Police Andika (conçue pour lecteurs débutants), uniquement sur les mots à lire
- Nouveau mode élève `reading` → route `/lecture`

## Tâches v0.7.0
- [x] Types `src/types/reading.ts`
- [x] `src/lib/reading/syllable-notation.ts` — parseSyllables (TDD)
- [x] `src/lib/reading/reading-colors.ts` — palette
- [x] `src/lib/reading/reading-words.ts` — 40 mots, niveaux 1 à 4 (10 par niveau)
- [x] `speakSyllables()` dans `src/lib/reading/reading-audio.ts` (karaoké)
- [x] `SyllableWord.tsx` — mot coloré + arcs + tap-to-speak
- [x] Activité « Découvrir » + « Lire et choisir »
- [x] `useReadingSession` (TDD) — session, XP
- [x] Page `/lecture` + mode `reading` (types, labels, formulaire parent, migration CHECK)
- [x] Tests verts, build OK, docs à jour

## Réalisé en plus
- [x] Bug corrigé : recharger `/home`, `/keyboard`, `/quiz`, `/parcours` renvoyait à l'accueil
  (`useActiveProfileId` renvoyait `'__none__'` pendant l'hydratation → `'__loading__'` + `isProfileReady()`)
- [x] Mode `reading` : `STUDENT_MODE_LABELS`, `StudentMode`, `ProfileMode`, formulaire parent, ModeSheet, LandingScreen

## Vérifications
- `npm run test` : 134/134 ✅ (72 nouveaux) · `tsc` ✅ · `npm run build` ✅
- Vérifié dans le navigateur (docker compose) : rendu couleurs / arcs / muettes, niveaux, activités
- Version : 0.6.0 → 0.7.0 (pas encore déployée : migration `20260928000000_reading_mode.sql` à appliquer en prod)

## Suite (v0.7.x)
- Activités « Assembler » et « Compter », estompage des couleurs en mode avancé, plus de mots par niveau
- SRS par mot, import CSV des mots, enregistrements audio, photos
