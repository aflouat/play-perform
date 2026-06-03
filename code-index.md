# Code Index — Play Perform
_Mis à jour : 2026-06-03 · v0.5.6_
> Lire avant de coder. Mettre à jour quand un fichier est créé, supprimé ou dépasse 150 lignes.

---

## ⚠️ Fichiers > 150 lignes (à refactoriser)

| Fichier | Lignes | Action |
|---|---|---|
| `src/lib/question-banks/brevet_questions.ts` | 1360 | Données pures — ok, ne pas splitter |

---

## Routes · `src/app/`

| Fichier | Lignes | Rôle |
|---|---|---|
| `app/page.tsx` | 127 | Accueil — liste élèves, sélection profil, footer admin |
| `app/layout.tsx` | — | Layout racine, providers |
| `app/globals.css` | — | Variables Tailwind v4 |
| `app/auth/page.tsx` | 143 | Connexion / Inscription / Mot de passe oublié |
| `app/auth/confirm/page.tsx` | — | Activation compte (lien email) |
| `app/auth/reset-password/page.tsx` | 109 | Réinitialisation mot de passe |
| `app/home/page.tsx` | — | Dashboard quiz élève — liste matières |
| `app/quiz/[subject]/page.tsx` | 129 | Quiz interactif, sablier 30s, XP décroissant, mode Anki |
| `app/keyboard/page.tsx` | 109 | Jeu clavier — Lettres / Mots / Sciences |
| `app/parent/page.tsx` | — | Gestion élèves (liste) |
| `app/parent/new/page.tsx` | — | Ajout élève |
| `app/admin/layout.tsx` | — | Guard admin |
| `app/admin/import/page.tsx` | 131 | Import CSV questions |
| `app/admin/questions/page.tsx` | 117 | Liste/filtrage questions importées |
| `app/admin/questions/[id]/page.tsx` | 124 | Édition question |
| `app/releases/page.tsx` | — | Historique versions |
| `app/faq/page.tsx` | 122 | Guide utilisateur |
| `app/esma/page.tsx` | — | Mode Esma (expérimental) |

---

## API Routes · `src/app/api/`

| Fichier | Méthodes | Rôle |
|---|---|---|
| `api/is-admin/route.ts` | GET | `{ isAdmin: boolean }` — vérifie JWT + ADMIN_EMAILS |
| `api/questions/route.ts` | GET | Liste questions par subject |
| `api/questions/[id]/route.ts` | PUT, DELETE | Mise à jour / suppression question |
| `api/questions/import/route.ts` | POST | Import batch CSV → DB |
| `api/students/route.ts` | GET, POST | Liste élèves / création |
| `api/students/[id]/route.ts` | DELETE, PATCH | Suppression / mise à jour élève |
| `api/releases/route.ts` | GET, POST | Historique releases — lecture / écriture |

---

## Composants · `src/components/`

### shared/
| Fichier | Lignes | Rôle |
|---|---|---|
| `QuizCard.tsx` | 129 | Carte question QCM avec timer, hint, options A/B/C/D |
| `QuizResultScreen.tsx` | 117 | Écran résultat — score, XP, bouton Anki si erreurs |
| `AnkiReviewSession.tsx` | 66 | Révision Anki — reboucle sur les erreurs jusqu'à 0 |
| `LandingScreen.tsx` | 42 | Écran d'accueil élève après sélection profil |
| `ModeSheet.tsx` | 55 | Sheet sélection mode (quiz / clavier) |
| `ProfileHeader.tsx` | 73 | En-tête profil — avatar, nom, XP, niveau |
| `AvatarPicker.tsx` | 39 | Sélecteur avatar (débloqués par XP) |
| `ReleaseTable.tsx` | 90 | Table releases avec recherche fulltext |

### keyboard/
| Fichier | Lignes | Rôle |
|---|---|---|
| `LetterMode.tsx` | 44 | Orchestrateur mode Lettres |
| `LetterCardView.tsx` | 104 | Vue carte lettre — affichage + saisie |
| `WordMode.tsx` | 50 | Orchestrateur mode Mots |
| `WordTypingView.tsx` | 103 | Vue saisie mot — caractères + validation |
| `ScienceMode.tsx` | 51 | Orchestrateur mode Sciences |
| `ScienceQuestionView.tsx` | 109 | Vue question science — QCM illustré |

### parent/
| Fichier | Lignes | Rôle |
|---|---|---|
| `StudentCard.tsx` | 108 | Carte élève — avatar, nom, mode, actions edit/delete |
| `AddStudentForm.tsx` | 98 | Formulaire création élève |

### admin/
| Fichier | Lignes | Rôle |
|---|---|---|
| `ImportDropzone.tsx` | 55 | Dropzone CSV + preview lignes |

### ui/ (atomes)
| Fichier | Lignes | Rôle |
|---|---|---|
| `AvatarCard.tsx` | 57 | Avatar circulaire avec badge niveau |
| `BrickGauge.tsx` | 36 | Jauge XP en briques |
| `HintButton.tsx` | 36 | Bouton indice (toggle) |
| `ModeSelector.tsx` | 64 | Sélecteur mode assisté/avancé |
| `QuizTimer.tsx` | 55 | Sablier 30s avec barre dégradée |
| `ScoreBadge.tsx` | 58 | Badge score — XP + niveau + streak |
| `XpGainToast.tsx` | 63 | Toast animation gain XP |
| `ZoneCard.tsx` | 64 | Carte zone (Lab / Clubs / Hub) |

### esma/
| Fichier | Lignes | Rôle |
|---|---|---|
| `WordChallenge.tsx` | 92 | Défi mot (mode Esma expérimental) |

### home/
| Fichier | Lignes | Rôle |
|---|---|---|
| `SubjectBadge.tsx` | 24 | Badge matière avec emoji et couleur |

---

## Hooks · `src/hooks/`

| Fichier | Lignes | Signature principale | Rôle |
|---|---|---|---|
| `useScore.ts` | — | `useScore(userId)` → `{ score, addXp, triggerGain }` | XP, niveau, badges, sync DB |
| `useAvatar.ts` | — | `useAvatar(userId, xp)` → `{ current, unlocked, select }` | Avatar actif, débloqués par XP |
| `useSpacedRepetition.ts` | — | `useSpacedRepetition(profileId, subject, questions)` → `{ due, updateProgress }` | SRS SM-2 — questions dues |
| `useQuizSession.ts` | — | `useQuizSession({ questions, profileId, subject })` → session state | État session quiz — courant, réponse, XP |
| `useQuizCard.ts` | — | `useQuizCard(question, onAnswer)` → `{ selected, locked, handleSelect }` | État d'une carte QCM |
| `useLearningMode.ts` | — | `useLearningMode(profileId, default)` → `{ mode, toggle }` | Persistance mode assisté/avancé |
| `useLetterGame.ts` | — | `useLetterGame({ profileId, onFinish })` → game state | Logique jeu Lettres |
| `useWordSession.ts` | — | `useWordSession({ addXp, triggerGain })` → session state | Logique session Mots |
| `useEngagement.ts` | 123 | `useEngagement({ userId, contentId, ... })` → `{ ping }` | Pings engagement, calcul bricks |
| `useActiveProfileId.ts` | — | `useActiveProfileId()` → `string` | Lit le profileId actif depuis localStorage |

---

## Lib · `src/lib/`

### Audio · `audio.ts` (121 lignes)
| Fonction | Rôle |
|---|---|
| `playSound(type)` | Web Audio API — correct / wrong / levelup / complete / click |
| `speakText(text, lang)` | TTS sobre |
| `speakEnthusiastic(word, lang)` | TTS enthousiaste avec interjection aléatoire |
| `speakInstruction(text, lang)` | TTS instruction claire |

### SRS · `srs-algorithm.ts` (143 lignes) + `srs-storage.ts` + `spaced-repetition.ts` (re-export)
| Fonction | Rôle |
|---|---|
| `initProgress(questionId, profileId)` | Initialise progression question |
| `updateProgress(progress, isCorrect)` | Met à jour SM-2 (ease, interval, nextReview) |
| `isDue(progress)` | Vérifie si la question est due aujourd'hui |
| `isRecentlySeen(progress)` | Filtre les questions vues récemment |
| `selectQuestions(allQ, progressMap, limit)` | Sélectionne N questions dues |
| `computeStats(progressMap)` | Stats par sujet — new/learning/review/mastered |
| `loadProgressMap(profileId, subject)` | Charge depuis localStorage |
| `saveProgressMap(profileId, subject, map)` | Persiste dans localStorage |

### Profils · `profiles.ts`
| Fonction | Rôle |
|---|---|
| `getActiveProfileId()` | Lit profileId depuis localStorage |
| `setActiveProfileId(id)` | Écrit profileId dans localStorage |
| `setActiveProfile(id, meta)` | Écrit id + méta (nom, avatar, mode) |
| `getActiveProfileMeta()` | Lit méta profil depuis localStorage |
| `clearActiveProfile()` | Efface le profil actif |
| `getProfileById(id)` | Cherche dans PROFILES |
| `getHomeRouteForProfile(profile)` | `/home`, `/keyboard`, etc. |

### Scores · `score-storage.ts` + `score-badges.ts`
| Élément | Rôle |
|---|---|
| `XP_PER_LEVEL = 100` | Constante niveau |
| `calcLevel(xp)` | XP → niveau |
| `initScore(userId)` | Score vide |
| `loadFromStorage(userId)` | Charge Score depuis localStorage |
| `saveToStorage(score)` | Persiste Score |
| `ALL_BADGES` | Catalogue badges |
| `unlockBadge(badges, id)` | Débloque un badge |

### Sujets · `subjects.ts`
| Élément | Rôle |
|---|---|
| `SUBJECT_META` | emoji + couleur bg par Subject |
| `ALL_SUBJECT_IDS` | Tableau de tous les Subject |
| `NAV_SUBJECTS` | Sujets affichés dans la nav |
| `getSubjectLabel(subject)` | Label lisible |
| `isValidSubject(s)` | Type guard |

### Learning Mode · `learning-mode.ts`
| Élément | Rôle |
|---|---|
| `loadMode(profileId, default)` | Charge depuis localStorage |
| `saveMode(profileId, mode)` | Persiste dans localStorage |
| `MODE_LABELS` | Labels assisté/avancé |
| `STUDENT_MODE_LABELS` | Labels + routes par mode élève |

### CSV · `csv-parser.ts` + `csv-tokenizer.ts`
| Fonction | Rôle |
|---|---|
| `parseAndValidateCsv(content)` | Valide CSV → `{ questions, errors }` |
| `splitRow(line)` | Tokenise une ligne CSV (gère guillemets) |
| `opt(value)` | Valeur optionnelle (null si vide) |
| `req(value, field)` | Valeur obligatoire (lève erreur si vide) |

### Avatars · `avatars.ts`
| Élément | Rôle |
|---|---|
| `AVATARS` | Catalogue 6 avatars avec seuils XP |
| `getAvatarById(id)` | Cherche par id |
| `getUnlockedAvatars(xp)` | Filtre selon XP actuel |

### Admin Auth · `admin-auth.ts`
| Fonction | Rôle |
|---|---|
| `isAdminAuthorized(req)` | Vérifie JWT Supabase + email dans ADMIN_EMAILS |

### Students API · `students-api.ts`
| Fonction | Rôle |
|---|---|
| `apiFetchStudents()` | GET /api/students |
| `apiInsertStudent(data)` | POST /api/students |
| `apiDeleteStudent(id)` | DELETE /api/students/:id |
| `apiUpdateStudent(id, updates)` | PATCH /api/students/:id |

### Question Banks · `lib/question-banks/`
| Fichier | Contenu |
|---|---|
| `index.ts` | Re-export + `getQuestionsForSubject(subject)` |
| `brevet_questions.ts` | 100+ questions brevet (maths, français, histoire…) |
| `anglais.ts` | Vocabulaire anglais |
| `espagnol.ts` | Vocabulaire espagnol |
| `chimie.ts` | Chimie collège |
| `espace.ts` | Sciences de l'espace |
| `geo.ts` | Géographie |
| `informatique.ts` | Informatique / algorithmique |
| `mecanique.ts` | Mécanique |
| `meteo.ts` | Météorologie |
| `telecom.ts` | Télécommunications |

---

## Couche DB · `src/lib/db/`

| Module | Types exportés | Fonctions exportées |
|---|---|---|
| `client.ts` | — | `getClient()`, `getServerClient()` |
| `students.ts` | `DbStudent`, `StudentMode`, `StudentLearningMode` | `fetchStudents`, `insertStudent`, `deleteStudent`, `updateStudent` |
| `questions.ts` | `DbQuestion` | `insertQuestions`, `fetchQuestionsFromDb`, `fetchAllQuestionsFromDb`, `updateQuestion`, `deleteQuestion` |
| `scores.ts` | `DbScore`, `DbBadge`, `DbQuizAnswer`, `DbKeyboardProgress` | `syncScoreToDb`, `fetchScoreFromDb`, `syncBadgeToDb`, `logQuizAnswer`, `logKeyboardSession` |
| `releases.ts` | `DbReleaseNote`, `ReleaseNoteFilter` | `insertReleaseNote`, `fetchReleaseNotes` |
| `index.ts` | (re-export tout) | — |

---

## Types · `src/types/index.ts`

| Type | Description |
|---|---|
| `User` | Utilisateur Supabase Auth |
| `Zone` | `'lab' \| 'clubs' \| 'hub'` |
| `Subject` | Union de toutes les matières |
| `AvatarId` | `'astronaut' \| 'scientist' \| 'ninja' \| 'explorer' \| 'wizard' \| 'robot'` |
| `Avatar` | `{ id, name, emoji, color, unlockXp, description }` |
| `BadgeId` | Union des 6 badges |
| `Badge` | `{ id, name, emoji, description, unlockedAt }` |
| `Score` | `{ userId, xp, level, badges, streak, lastActivityAt }` |
| `XpGain` | `{ amount, reason, timestamp }` |
| `QuizQuestion` | `{ id, subject, question, options, correctId, difficulty, hint?, image? }` |
| `QuizOptionId` | `'A' \| 'B' \| 'C' \| 'D'` |
| `QuizDifficulty` | `1 \| 2 \| 3 \| 4` |
| `QuizAnswer` | `{ questionId, selectedOptionId, isCorrect, timeMs }` |
| `QuizSession` | Tableau de réponses + métadonnées session |
| `QuestionState` | `'new' \| 'learning' \| 'review' \| 'mastered'` |
| `QuestionProgress` | État SRS d'une question (ease, interval, nextReview…) |
| `DIFFICULTY_META` | Constante — labels, couleurs, XP de base par difficulté |

---

## Tests · `src/__tests__/`

| Fichier | Type | Ce qui est testé |
|---|---|---|
| `unit/useScore.test.ts` | Unit | `useScore` — XP, niveau, badges, streak |
| `unit/useAvatar.test.ts` | Unit | `useAvatar` — débloquage selon XP |
| `unit/useEngagement.test.ts` | Unit | `useEngagement` — pings, bricks, throttle |
| `unit/csv-parser.test.ts` | Unit | `parseAndValidateCsv` — cas valides et erreurs |
| `integration/QuizCard.test.tsx` | Intégration | `QuizCard` — sélection réponse, timer, hint |
| `integration/ScoreBadge.test.tsx` | Intégration | `ScoreBadge` — affichage XP / niveau |
| `integration/AvatarPicker.test.tsx` | Intégration | `AvatarPicker` — sélection avatar débloqué |

---

## Flux de données clés

```
Parent login (Supabase Auth)
  → /api/students (service role key, bypass RLS)
  → page.tsx affiche profils

Clic profil
  → setActiveProfile(id, meta) [localStorage]
  → /home ou /keyboard selon mode

Quiz (/quiz/[subject])
  → fetchQuestionsFromDb() OU question-banks statiques
  → useSpacedRepetition → questions dues
  → useQuizSession → réponses, XP
  → useScore.addXp() → syncScoreToDb()
  → logQuizAnswer()
  → si erreurs : AnkiReviewSession

Admin CSV import
  → ImportDropzone → parseAndValidateCsv
  → POST /api/questions/import → insertQuestions()
```
