# Code Index — Play Perform
_Mis à jour : 2026-10-07 · v0.7.0_
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
| `app/page.tsx` | 127 | Accueil — visiteur : `LandingPage` (module landing) · parent : liste élèves, sélection profil |
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
| `app/mots/page.tsx` | — | Mode Mots — mots illustrés FR/EN/ES |
| `app/lecture/page.tsx` | 68 | Lecture syllabique — orchestre toolbar + activités |

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
| `api/health/route.ts` | GET | Réglages serveur présents (booléens, super admin) |
| `api/competition/route.ts` | GET | Classement du centre (pseudos), défi de la semaine, mes médailles |
| `api/competition/challenge/route.ts` | POST | Joue le défi de la semaine (score recalculé serveur, 1 essai) |
| `api/competition/profile/route.ts` | PUT | Pseudo / visibilité au classement (enseignant) |
| `api/competition/awards/route.ts` | GET, DELETE | Médailles de mes élèves / retrait (enseignant) |
| `api/progress/route.ts` | PUT | XP / badge d'un apprenant (session apprenant ou enseignant, propriété du profil vérifiée) |
| `api/dashboard/centre/route.ts` | GET | Tableau de bord du centre (responsable : tout le centre ; enseignant : ses élèves) |
| `api/dashboard/examiner/route.ts` | GET | File de corrections de l'examinateur, par centre |
| `api/competition/pair/route.ts` | GET, POST | Binôme de la semaine et récupération du bonus |
| `api/competition/feed/route.ts` | GET | Fil d'activité du centre (pseudos) |
| `api/competition/cheer/route.ts` | POST | « Bravo » sur la réussite d'un camarade |
| `api/competition/events/[id]/route.ts` | DELETE | L'enseignant retire un élément du fil |
| `api/stats/answers/route.ts` | GET, POST | Statistiques anonymes des réponses (pièges classiques) |
| `api/profile/route.ts` | GET, PUT | Pseudo, prénom, nom, centre d'un apprenant (lui-même ou son enseignant) |
| `api/diploma/route.ts` | GET | Éligibilité et contenu du diplôme, calculés depuis la base |
| `api/me/route.ts` | GET | Mon e-mail, drapeau super admin, mes centres et rôles |
| `api/organizations/route.ts` | GET, POST | Centres visibles / création (super admin) |
| `api/centre-applications/route.ts` | POST, GET | Dossier d'un nouveau centre (public, 5 / h / IP) ; dossiers en attente (super admin) |
| `api/centre-applications/mine/route.ts` | GET | Mon dernier dossier (bandeau « Mon centre ») |
| `api/centre-applications/[id]/route.ts` | PATCH | Ouvrir (organisation + responsable) ou refuser (super admin) |
| `api/organizations/[id]/route.ts` | PUT | Fiche légale du centre : SIREN, SIRET, adresse (responsable / super admin) |
| `api/organizations/[id]/members/route.ts` | GET, POST, DELETE | Équipe d'un centre : recrutement par invitation e-mail (responsable de centre) |
| `api/push/subscription/route.ts` | PUT, DELETE | Abonnement Web Push d'un appareil + ses rappels (apprenant / enseignant) |
| `api/push/dispatch/route.ts` | GET | Envoie les rappels dus (planificateur, `Bearer CRON_SECRET`) |
| `api/learner/login/route.ts` | POST | Code d'accès → jeton apprenant signé + profil public (10 essais / 15 min / IP) |
| `api/students/[id]/access-code/route.ts` | POST | (Re)génère le code d'accès d'un élève (enseignant) |
| `api/skill-enrollments/route.ts` | GET, POST | Demandes d'inscription : liste (apprenant / admin `?status=pending`), envoi |
| `api/skill-enrollments/[id]/route.ts` | PATCH | Décision du centre (admin) |
| `api/skill-levels/route.ts` | GET, PUT | Niveaux par compétence persistés (parent) ; PUT relève sans jamais abaisser |
| `api/skill-evaluations/route.ts` | GET, POST | Évaluations rédigées : liste (parent / admin `?status=pending`), envoi |
| `api/skill-evaluations/[id]/route.ts` | PATCH | Correction par l'examinateur (admin) |
| `api/pricing/route.ts` | GET | Offres actives (public) ; `?all=1` toutes (admin) |
| `api/pricing/[id]/route.ts` | PUT | Mise à jour d'une offre (admin, validée) |

---

## Stack locale · `docker-compose.yml`, `docker/`, `supabase/`

| Fichier | Rôle |
|---|---|
| `docker-compose.yml` | app (next dev) + db, auth, rest, kong, studio, meta, mailpit, db-init ; `app-prod` (profil prod) |
| `docker/supabase/roles.sql` | Init Postgres : mots de passe des rôles + secret JWT |
| `docker/supabase/kong.yml` | Routes passerelle `/auth/v1`, `/rest/v1`, `/pg` |
| `docker/supabase/migrate.sh` | Applique les migrations non jouées (table `_local_migrations`) + seed au 1er run |
| `supabase/migrations/20260927000000_initial_schema.sql` | Schéma complet (10 tables + RLS) reconstruit depuis la prod |
| `supabase/migrations/20260928000000_reading_mode.sql` | CHECK `students.mode` accepte `reading` |
| `supabase/migrations/20261020000000_community.sql` | `answer_stats` + `bump_answer_stat`, `activity_events`, `activity_cheers`, `pair_bonus_claims` |
| `supabase/migrations/20261019000000_learner_identity.sql` | `students.last_name` (diplôme) |
| `supabase/migrations/20261018000000_centre_applications.sql` | `centre_applications` (dossiers de centres, SIRET unique si ouvert) |
| `supabase/migrations/20261017000000_centre_identity.sql` | `organizations` : raison sociale, SIREN, SIRET (unique), adresse, code postal, ville |
| `supabase/migrations/20261016000000_competition.sql` | `students.nickname/show_in_ranking`, `challenge_results`, `reward_revocations` |
| `supabase/migrations/20261015000000_anon_parent_only.sql` | Accès anonymes limités aux lignes de la société mère (**non appliquée en prod**) |
| `supabase/migrations/20261014000000_organizations.sql` | `organizations`, `memberships`, `platform_admins`, `organization_id` sur students / profiles / skill_enrollments / skill_evaluations |
| `supabase/migrations/20261013000000_push_subscriptions.sql` | Table `push_subscriptions` |
| `supabase/migrations/20261012000000_skill_enrollments.sql` | Table `skill_enrollments` |
| `supabase/migrations/20261011000000_learner_access.sql` | `students.access_code` (unique) |
| `supabase/migrations/20261010000000_skill_levels.sql` | Table `skill_levels` (profil × compétence → niveau) |
| `supabase/migrations/20261009000000_skill_evaluations.sql` | Table `skill_evaluations` (RLS sans policy : API service role) |
| `supabase/migrations/20261007000000_pricing_plans.sql` | Table `pricing_plans` + 3 offres par défaut |
| `supabase/seed.sql` | Données démo : parent `demo@playperform.local`, 3 élèves, 1 parcours |
| `supabase/local.env.example` | Variables pour `npm run dev` sur l'hôte contre la stack compose |

`getServerSupabaseUrl()` (`src/lib/db/client.ts`) : `SUPABASE_INTERNAL_URL ?? NEXT_PUBLIC_SUPABASE_URL` — utilisé par `getServerClient`, `admin-auth.ts`, `api/students/*`.

---

## Modules · `src/modules/` (API publique = `index.ts` uniquement)

| Module | Fichiers | API publique |
|---|---|---|
| `skills` | `domain/skill.ts`, `infra/skills-seed.ts` | `getSkills()`, `getSkillById(id)`, `SKILL_LEVELS`, `getSkillLevel(n)`, `syncSkillLevels/persistSkillLevel/mergeLevels/applyPlacements/validateLevelUpdate`, `getCourseSheet`, `CourseSheetView`, `EnrollmentForm`, `validateEnrollmentRequest/Decision`, `isEnrolled`, `useEnrollments`, `remainingMinutes/dailyMinutesNeeded/victoryDate/isReminderDue/reminderMessage`, `getSkillPlan/setSkillPlan`, `PlanEditor`, `sendDueReminders`, `ReminderRunner`, `enablePush/syncPushReminders/isPushActive`, `zonedNow/dueScheduledReminders` · `lib/push/{repository,send,dispatch,validate}.ts` (serveur), `useSkillLevels/getSkillLevelFor/setSkillLevel/advanceSkillLevel/getAllSkillLevels` (niveau par compétence), `pickSkillQuestions`, `toFlashcards`, `isQuizPassed`, `nextLevelAfterQuiz`, `validateSubmission`, `validateCorrection`, `levelAfterEvaluations`, `getEvaluationPrompt`, UI `SkillMap` (ville), `SkillDetailPanel`, `BuildingTile`, `GoalEditor`, `ReviewsSummary`, `masteryPercent/buildingFor/summarizeReviews/paceToGoal`, `loadSkillReviews/recordSkillAnswer`, `getSkillGoal/setSkillGoal`, `SkillActivityView`, `EvaluationPanel` · `server.ts` : évaluations (service role), types `Skill`, `SkillLevelNumber` |
| `quizzes` | `domain/placement.ts`, `infra/placement-bank-{a,b}.ts`, `infra/placement-question.ts` | `getPlacementTest(skillId)`, `scoreAnswer(q, index\|null)`, `estimateStartLevel(answers)`, `reviewAnswers(questions, chosen)`, types `PlacementQuestion`, `PlacementAnswer`, `PlacementResult` |
| (partagé) | `hooks/useRole.ts`, `shared/ui/{SiteHeader,RoleGate}.tsx` | `useRole()` → `loading \| visitor \| learner \| teacher` ; `RoleGate deny=…` |
| `dashboards` | `domain/{centre,examiner,learner}.ts`, `application/useLearnerSnapshot.ts`, `infra/{dashboard-repository,dashboard-client}.ts`, `ui/{CentreDashboardView,ExaminerDashboardView,LearnerHome}.tsx`, `server.ts` | `onboardingSteps`, `firstQuizHref`, `applyStartLevel`, `FirstSteps`, `PlacementStep`, `activityStatus`, `buildCentreDashboard`, `buildExaminerDashboard`, `nextActionsFor`, `useLearnerSnapshot` · `skills` : `getSeen/markSeen` (nouveautés vues) |
| `community` | `domain/traps.ts`, `infra/{stats-repository,community-client}.ts`, `ui/ClassicTraps.tsx`, `server.ts` | `trapSummary`, `trapMessage`, `constructiveFeedback`, `rankTraps`, `fetchDistributions`, `sendAnswers`, `ClassicTraps` |
| `competition` | `domain/{week,nickname,identity,ranking,seed}.ts`, `ui/IdentityForm.tsx` (+ `validatePersonName`, `validateIdentityUpdate`, `isIdentityReady`, `canPrintDiploma`), `application/{challenge,view}.ts`, `infra/{competition-repository,competition-client}.ts`, `ui/{Leaderboard,ChallengePlayer,CompetitionPanel}.tsx`, `server.ts` | `pairsFor`, `groupOf`, `bonusStatus`, `buildPairView`, `describeEvent`, `canCheer`, `PairCard`, `ActivityFeed`, `isoWeek`, `previousWeek`, `validateNickname`, `generateNickname`, `rankBy`, `rankWeekly`, `awardsFor`, `challengeFor`, `scoreChallenge`, `buildCompetitionView`, `pastAwardsOf`, `CompetitionPanel` |
| `organizations` | `domain/{access,inputs}.ts`, `infra/{organization-repository,organization-client}.ts`, `ui/{OrganizationCard,TeamLinks}.tsx`, `server.ts` | `DEFAULT_ORGANIZATION_ID`, `canRecruit`, `canManageStudents`, `canDecideEnrollments`, `canCorrectEvaluations`, `organizationsWhere`, `studentOrganization`, `validateOrganizationInput`, `validateMemberInput`, `validateSiren/Siret`, `validateCentreIdentity`, `isIdentityComplete`, `adminLinks`, `centreHome`, `navAccessOf`, `AdminNav`, `SuperAdminGate`, `CentreCard`, `CentreIdentityForm`, `CentreSignupForm`, `CentreApplicationBanner`, `ApplicationsReview`, `validateCentreApplication`, `validateApplicationDecision`, `fetchMyAccess`, `recruit`, `TeamLinks` · `lib/access-context.ts` : `getAccessContext(req)` |
| `pricing` | `domain/plan.ts`, `infra/pricing-client.ts`, `infra/pricing-repository.ts` (serveur), `ui/{PricingSection,PlanEditor}.tsx`, `server.ts` | `formatPrice`, `billingSuffix`, `eurosToCents`, `centsToEuros`, `yearlySavingPercent`, `validatePlanUpdate`, `fetchActivePlans`, `fetchAllPlans`, `savePlan`, `PricingSection`, `PlanEditor` · `server.ts` : `fetchPlans`, `updatePlan` |
| `landing` | `application/useLandingFlow.ts`, `infra/placement-storage.ts`, `ui/{LandingPage,Hero,FlowStepper,ModeChoice,SkillPicker,PlacementTest,PlacementResultView,ParentsSection}.tsx` | `LandingPage` |

Partagé (`src/shared/ui`) : `AppVersion` (version depuis `NEXT_PUBLIC_APP_VERSION`), `SiteFooter`.

Flux tarifs : `/admin/pricing` → `PlanEditor` → `PUT /api/pricing/:id` (`isAdminAuthorized` + `validatePlanUpdate`) → `pricing_plans` ; accueil → `PricingSection` → `GET /api/pricing`.

Flux visiteur : `LandingPage` → `useLandingFlow` (mode → skill → test → result) → `getPlacementTest` / `estimateStartLevel` → `savePlacement` (localStorage `pp:placements`).

---

## Composants · `src/components/`

### shared/
| Fichier | Lignes | Rôle |
|---|---|---|
| `QuizCard.tsx` | 129 | Carte question QCM avec timer, hint, options A/B/C/D |
| `QuizResultScreen.tsx` | 117 | Écran résultat — score, XP, bouton Anki si erreurs |
| `AnkiReviewSession.tsx` | 66 | Révision Anki — reboucle sur les erreurs jusqu'à 0 |
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

### words/
| Fichier | Lignes | Rôle |
|---|---|---|
| `WordChallenge.tsx` | 92 | Défi mot (mode Mots) |

### reading/ (lecture syllabique)
| Fichier | Lignes | Rôle |
|---|---|---|
| `SyllableWord.tsx` | 56 | Mot en syllabes colorées + arcs + lettres muettes grises, tap-to-speak, surlignage karaoké |
| `DiscoverView.tsx` | 61 | Activité Découvrir — image, karaoké (auto en assisté), « J'ai lu » |
| `ReadChooseView.tsx` | 85 | Activité Lire et choisir — 3 images, indice (karaoké + image grisée) |
| `ReadingToolbar.tsx` | 58 | Onglets activité, niveaux 1-4, progression |

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
| `useActiveProfileId.ts` | 38 | `useActiveProfileId()` → `string` · `useActiveProfileName()` · `isProfileReady(id)` | Profil actif (localStorage) : `'__loading__'` pendant l'hydratation, `'__none__'` si absent |
| `useReadingSession.ts` | 78 | `useReadingSession({ addXp, triggerGain })` → session, `markRead`, `select`, `setActivity`, `setLevel` | Session lecture syllabique (XP 5 / 10) |

---

## Lib · `src/lib/`

### Lecture · `reading/`
| Fichier | Rôle |
|---|---|
| `syllable-notation.ts` | `parseSyllables(notation, say?)` → `{ word, syllables }` — lève une erreur si notation invalide |
| `reading-words.ts` | `READING_WORDS` (40 mots, 4 niveaux), `READING_LEVELS`, `getWordsForLevel(level)` |
| `reading-session.ts` | `buildReadingSession(level, length?, random?)` → `ReadingChallenge[]` (cible + 3 images) |
| `reading-audio.ts` | `speakSyllables(syllables, word, { onSyllable, onEnd })` karaoké, `stopSpeaking()` |
| `reading-colors.ts` | Classes couleurs syllabes / arcs / muet / surlignage |
| `reading-font.ts` | `readingFont` (Andika) |

Types : `src/types/reading.ts` (`ReadingWord`, `Syllable`, `ParsedWord`, `ReadingLevel`, `ReadingActivity`).

### Audio · `audio.ts` (121 lignes, `getBestVoice` exporté)
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
| `integration/faq-alignment.test.tsx` | Intégration | FAQ alignée sur README, version, avatars, XP, matières, fonctionnalités |
| `unit/release-tag.test.ts` | Unit | Script `release:tag` — semver, CHANGELOG, tag, note persistée, README synchronisé |
| `unit/onboarding.test.ts`, `integration/first-connection.test.tsx` | Unit + intégration | Première connexion en 3 étapes (profil, niveau, premier quiz) |
| `unit/community-traps.test.ts`, `unit/community-social.test.ts`, `unit/community-routes.test.ts`, `integration/community-ui.test.tsx` | Unit + intégration | Pièges classiques, échec constructif, binômes, bonus, fil, Bravo, modération |
| `unit/learner-identity.test.ts`, `unit/profile-route.test.ts`, `unit/diploma.test.ts`, `unit/diploma-route.test.ts`, `unit/enrollment-routes.test.ts`, `integration/learner-journey.test.tsx` | Unit + intégration | Pseudo / prénom / nom, diplôme, inscription automatique, quiz libres |
| `unit/dashboards-domain.test.ts`, `unit/dashboard-routes.test.ts`, `integration/dashboards-ui.test.tsx` | Unit + intégration | Tableaux de bord centre / examinateur / accueil apprenant |
| `unit/admin-navigation.test.ts`, `integration/admin-navigation.test.tsx`, `unit/admin-auth.test.ts` | Unit + intégration | Menu d'administration par rôle, pages réservées à la société mère, `isAdminAuthorized` |
| `unit/centre-application.test.ts`, `unit/centre-application-routes.test.ts` | Unit | Dossier de centre : validation, public + limite de débit, décision réservée au super admin |
| `unit/organization-identity.test.ts`, `integration/role-experience.test.tsx` | Unit + intégration | SIREN / SIRET (Luhn), fiche légale ; en-tête et accès par rôle |
| `unit/competition-domain.test.ts`, `unit/competition-view.test.ts`, `unit/competition-routes.test.ts` | Unit | Semaines ISO, pseudos, classements, défi hebdomadaire, médailles, routes |
| `unit/placement-review.test.ts`, `integration/PlacementReview.test.tsx` | Unit + intégration | Revue des réponses du test de niveau (`reviewAnswers`, stockage, page, lien depuis le résultat) |
| `unit/progress-api.test.ts` | Unit | Validation et contrôle d'accès de la synchro XP / badges |
| `unit/organization-permissions.test.ts`, `unit/org-scoped-routes.test.ts` | Unit | Rôles et permissions par centre ; routes d'inscription / correction limitées au centre |
| `unit/push-schedule.test.ts`, `unit/push-dispatch.test.ts` | Unit | Fuseau horaire, rappels dus, envoi et nettoyage des abonnements |
| `unit/learner-access.test.ts` | Unit | Jeton apprenant signé, codes d'accès, limiteur d'essais |
| `unit/skill-enrollment.test.ts`, `unit/skill-effort.test.ts` | Unit | Inscriptions aux cours, effort quotidien, rappels |
| `unit/skill-dashboard.test.ts` | Unit | Maîtrise, bâtiments, synthèse des révisions, rythme vers l'objectif |
| `unit/skill-levels.test.ts`, `unit/claim-placements.test.ts` | Unit | Fusion/validation des niveaux, reprise du test visiteur, compétence Claude Platform |
| `unit/skill-activities.test.ts`, `unit/skill-evaluation.test.ts`, `unit/skill-progress.test.ts` | Unit | Niveaux par compétence, quiz/flashcards, évaluations |
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
