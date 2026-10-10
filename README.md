#  Play Perform · v0.12.0

Plateforme d'apprentissage ludique pour les ados & jeunes. L'enseignant (ou le tuteur / adulte responsable) crée un compte, ajoute ses élèves et leur donne un **code d'accès** ; chaque apprenant ouvre alors ses compétences sur `/apprenant` — plus aucun élève « démo » n'est ajouté d'office. la ptf dispose d'un acces admin pour gerer les questions sur la GUI et ou batch API / CSV

## Authentification

| Rôle | Accès |
|---|---|
| Centre de formation (personne morale : raison sociale, SIREN, établissement SIRET, adresse) | S'inscrit sur `/auth` ; son espace `/enseignant` (« Mon centre ») : fiche légale, élèves, codes d'accès, équipe |
| Apprenant | Saisit son code (8 caractères) sur `/apprenant` → session signée de 30 jours sur son appareil ; accède à ses compétences uniquement |

**Un rôle par appareil, des espaces séparés** : l'en-tête n'affiche que l'espace du rôle courant (visiteur : « Je suis apprenant » / « Centre de formation » ; apprenant : Ma ville, Compétition ; centre : Mon centre, Corrections, Inscriptions, Équipe). Un apprenant est renvoyé vers sa ville s'il ouvre `/enseignant` ou `/admin/*` ; se connecter comme centre ferme la session apprenant, et inversement.
| Super admin (société mère) | Email dans `ADMIN_EMAILS` ou table `platform_admins` → crée les centres, voit tout |
| Responsable de centre / enseignant / examinateur | Rôles dans `memberships` (un examinateur peut appartenir à plusieurs centres) : le centre décide des inscriptions de ses élèves, l'examinateur corrige leurs évaluations |

**Quiz et flashcards : libres, sans inscription.** La **formation complète** (évaluations corrigées par un examinateur, plan de travail et rappels, diplôme) demande une inscription **validée automatiquement** après lecture de la fiche du cours (motivation facultative) ; le centre la voit dans `/admin/inscriptions` (30 derniers jours) et peut retirer l'accès avec une raison.

**Identité de l'apprenant** : un **pseudo** (3-20 caractères, unique dans le centre, ne contenant ni son prénom ni son nom ; seul nom vu des autres : classement, communauté) et son **prénom + nom** (diplôme uniquement). Il les renseigne depuis « Mon profil » sur son accueil (`GET/PUT /api/profile`) ; l'enseignant peut aussi les saisir. **Diplôme** `/diplome/[skillId]` : éligibilité calculée côté serveur (`GET /api/diploma`) — inscrit, niveau 5 en base, évaluation de niveau ≥ 4 validée par un examinateur, prénom et nom renseignés ; page imprimable A4 paysage avec référence `PP-XXXXXXXX`.

## Organisations (franchise)
Une seule application et une seule base ; chaque centre de formation est une organisation. La société mère « Play Perform » (id fixe `00000000-0000-4000-8000-000000000001`) possède l'existant et les accès anonymes. Rôles : super admin (`ADMIN_EMAILS` en amorçage, table `platform_admins`), responsable de centre `org_admin` (recrute, décide, corrige), enseignant `teacher` (élèves, inscriptions), examinateur `examiner` (corrections, un ou plusieurs centres). Permissions : fonctions pures dans `src/modules/organizations/domain/access.ts`, appliquées par `getAccessContext`. `organization_id` (défaut = société mère) sur `students`, `profiles`, `skill_enrollments`, `skill_evaluations`, `challenge_results` ; migrations additives, `ADMIN_EMAILS` reste super admin.
- **Un seul menu côté centre** (`adminLinks`, `AdminNav`, sous l'en-tête sur `/enseignant`, `/examinateur` et `/admin/*` ; l'en-tête se limite au logo et à la déconnexion) : le super admin voit tout (Mon centre, Questions, Import CSV, Parcours, Tarifs, Centres, Inscriptions, Corrections, Médailles) ; un responsable de centre Mon centre, Inscriptions, Corrections, Médailles, Équipe ; un enseignant Mon centre, Inscriptions, Médailles ; un examinateur Mes corrections et Corrections. Les pages des ressources communes (`/admin/questions`, `/import`, `/parcours`, `/pricing`) affichent « réservée à la société mère » aux autres (`SuperAdminGate`), et leurs API sont refusées côté serveur (`isAdminAuthorized` = super admin, `ADMIN_EMAILS` ou `platform_admins`).
- **Catalogue de compétences, questions et tarifs communs à tous les centres** (décision produit : pas d'`organization_id` dessus).
- **Isolation** : XP et badges passent par `PUT /api/progress` (propriété du profil vérifiée) ; la migration `20261015000000_anon_parent_only.sql` limite les accès anonymes aux lignes de la société mère (à appliquer avant d'ouvrir un centre externe, procédure et retour arrière dans `docs/deploiement.md`).
- Un centre s'inscrit par dossier (compte + raison sociale, SIREN, SIRET, adresse) que la société mère examine ; un SIRET = un centre.

## Ergonomie B2C / B2B
Deux portes distinctes, jamais mélangées. Apprenant : ton énergique, violet/ambre, verbes d'action (« Je commence mon apprentissage »), entrée par le bouton principal et `/connexion`, connexion par code. Centre : ton sobre, gris ardoise, « Gérer mon centre de formation », entrée par un bandeau à part, la section dédiée de l'accueil et une carte discrète de `/connexion`. Règles : le lien du centre n'est jamais dans le même bloc de boutons que celui de l'apprenant ; aucun CTA d'apprenant ne mène à la connexion du centre (« Entrer mon code d'accès » → `/apprenant`) ; une fois connecté, chacun ne voit que son espace (un rôle par appareil, `RoleGate` + en-tête par rôle). Testé dans `integration/role-experience.test.tsx`.

## Routes

| Route | Description |
|---|---|
| `/` | Visiteur : page d'accueil (mode sans compte / avec compte, choix d'une compétence, test de niveau) · Enseignant connecté : liste des élèves |
| `/verifier/[référence]` | Public : vérification d'un certificat (QR code du PDF ou référence saisie) — authentique, révoqué, falsifié ou inconnu ; titulaire en prénom + initiale ; aperçu Open Graph pour LinkedIn |
| `/admin/audit-chats` | Société mère : audit des chats de binôme (tous les fils, signalés d'abord, transcription avec noms réels) |
| `/examinateur/agenda` | Examinateur : agenda des oraux à la semaine — ajouter des disponibilités (une plage découpée en créneaux de 30 min par défaut, ou 15 / 45 / 60), voir qui a réservé quelle compétence, fermer / annuler, saisir le résultat après l'oral |
| `/centres/[slug]` | Landing publique d'un centre franchisé (rendue côté serveur, titre et description propres au centre) : présentation locale, méthode (en ligne → oral → diplôme), parcours proposés, créneaux d'oral disponibles, adresse, demande de rappel |
| `/examinateur` | Examinateur : file des évaluations à corriger (en attente, plus longue attente, corrigées cette semaine, délai moyen, par centre) ; l'examinateur seul y arrive à la place de « Mon centre » |
| `/classement` | Apprenant : compétition et communauté — binôme de la semaine, défi hebdomadaire, classement du centre par pseudo (XP, série, niveaux), médailles, fil des réussites avec « Bravo », mur des trophées |
| `/enseignant/classement` | Enseignant : médailles récentes de ses élèves, retrait possible |
| `/test-de-niveau/[skillId]` | Visiteur : revue question par question de son test de niveau (feedback), sans compte |
| `/connexion` | Portail d'entrée : carte apprenant (grande, violette) et carte centre (petite, sobre) |
| `/auth` | Centre de formation : connexion / mot de passe oublié (l'inscription passe par `/centre/inscription`) |
| `/centre/inscription` | Dossier d'un nouveau centre : compte + raison sociale, SIREN, SIRET, adresse — examiné par la société mère |
| `/auth/confirm` | Activation de compte (lien email) |
| `/auth/reset-password` | Réinitialisation mot de passe |
| `/enseignant`, `/enseignant/new` | Espace enseignant : gestion des élèves (ajout / édition / suppression) et de leur code d'accès (`/parent` redirige ici) |
| `/apprenant` | Espace apprenant : saisie du code d'accès |
| `/competences/[skillId]/fiche` | Fiche du cours + inscription immédiate à la formation complète |
| `/diplome/[skillId]` | Diplôme imprimable (prénom + nom, centre, date, référence) quand le parcours est validé |
| `/admin/inscriptions` | Centre : accepter / refuser les demandes d'inscription de ses élèves |
| `/admin/organisations` | Super admin : examiner les dossiers de centres (ouverture = création du centre + responsable), créer des centres ; responsable de centre : recruter enseignants et examinateurs |
| `/home` | Dashboard quiz eleve (toutes matières) |
| `/quiz/[subject]` | Quiz interactif avec sablier 30s et XP décroissants |
| `/keyboard` | Jeu d'enfant initié — Lettres / Mots / Sciences /Mots illustrés FR/EN/ES|
| `/mots` | Mots illustrés FR/EN/ES (mode Mots) |
| `/lecture` | Lecture syllabique — Découvrir / Lire et choisir, 4 niveaux |
| `/admin/import` | Import questions CSV (admin) |
| `/admin/questions` | Liste et édition questions importées (admin) |
| `/releases` | Historique des versions (recherche date / version / fulltext) |
| `/faq` | Guide utilisateur |
| `/parcours/[id]` | Session de jeu d'un parcours multi-discipline |
| `/admin/parcours` | Gestion des parcours (admin) |
| `/admin/parcours/[id]` | Édition parcours + inscriptions élèves (admin) |
| `/competences` | Élève : **centre de commande** (colonne principale ≈ 75 % : carte au trésor des phases, « Reprendre mon apprentissage », Aujourd'hui, ville des compétences ; colonne latérale ≈ 25 % : série 🔥, rang, 3 derniers badges, fil du centre) ; ville : un bâtiment par compétence, au clic barre vers la maîtrise, révisions, objectif de date |
| `/confidentialite` | Politique de confidentialité (données des mineurs) |
| `/competences/[skillId]` | Niveau de la compétence + activités pour monter : Quiz (4/5 = niveau suivant), Flashcards, Évaluation rédigée |
| `/admin/evaluations` | Examinateur (admin) : correction des évaluations rédigées (valider = +1 niveau) |
| `/admin/pricing` | Tarifs des abonnements 1 mois / 1 an / à vie (admin) |
| `/admin/formations` | Société mère : catalogue des parcours de formation — créer / modifier un parcours, ses chapitres dans les 4 phases (titre, compétence, niveau visé, niveau minimum requis), durées, proposé ou retiré |

## Modes de jeu
 
| Mode | Route | Profil type |
|---|---|---|
| 📚 Quiz | `/home` → `/quiz/[subject]` | college |
| ⌨️ Clavier | `/keyboard` | Elemenetaire avec mode assisté activable |
| 🌸 Mots | `/mots` | Mots illustrés FR/EN/ES |
| 📖 Lecture | `/lecture` | CP — lecture pa r syllabes |

### 📖 Lecture syllabique
Syllabes en couleurs alternées (bleu / rouge), lettres muettes en gris, arc sous chaque syllabe, police Andika.
Mots annotés à la main dans `src/lib/reading/reading-words.ts` : `-` sépare les syllabes, `()` = muet
(`'É-co-le'`, `'blan(c)'`, `'pa-ren(ts)'`), `say` corrige la synthèse vocale.
- **Découvrir** : image + mot, toucher une syllabe la prononce, « Écouter » = lecture karaoké (auto en mode assisté)
- **Lire et choisir** : lire le mot et choisir la bonne image parmi 3 ; indice (assisté) = lecture + une image grisée
- Niveaux : 1 = 2 syllabes · 2 = 3 syllabes · 3 = sons ou/on/oi… · 4 = lettres muettes

Le parent choisit l'activité par défaut de chaque élève. En cliquant sur un profil, un **mode selector** propose les 4 activités — le mode par défaut est mis en valeur mais peut être changé pour cette session uniquement.

## Architecture

```
src/
├── app/
│   ├── (public)          # /, /auth, /faq, /releases
│   ├── admin/            # /admin/import, /admin/questions
│   ├── api/              # /api/students, /api/questions, /api/releases
│   ├── home/             # Dashboard quiz
│   ├── keyboard/         # Jeu clavier/sciences
│   ├── enseignant/       # Gestion élèves + codes d'accès
│   ├── apprenant/        # Connexion par code
│   └── quiz/[subject]/   # Quiz interactif
├── components/
│   ├── admin/            # ImportDropzone
│   ├── keyboard/         # LetterMode, WordMode, ScienceMode
│   ├── enseignant/       # StudentCard, AddStudentForm, AccessCodeBox
│   ├── shared/           # QuizCard, QuizResultScreen, ModeSheet, LandingScreen
│   └── ui/               # XpGainToast, QuizTimer, AvatarCard, ScoreBadge…
├── hooks/                # useScore, useAvatar, useLearningMode, useSpacedRepetition
├── lib/
│   ├── db/               # client, scores, questions, students, releases, parcours
│   ├── question-banks/   # ~220+ questions (100+ brevet + 20 avec indices)
│   ├── admin-auth.ts     # isAdminAuthorized (JWT Supabase + ADMIN_EMAILS)
│   ├── students-api.ts   # Client → /api/students (bypass RLS)
│   ├── learning-mode.ts  # LearningMode, STUDENT_MODE_LABELS
│   └── spaced-repetition.ts # Algorithme SM-2
└── types/                # index.ts (User, Subject, Quiz, Score, SRS)
```

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # requis : API élèves, niveaux, évaluations, inscriptions
LEARNER_TOKEN_SECRET=        # optionnel : signe les sessions apprenant (sinon dérivé de la clé service role)
CERTIFICATE_SECRET=          # recommandé : signe les certificats (sinon LEARNER_TOKEN_SECRET) — ne jamais le changer une fois des certificats émis
ADMIN_EMAILS=                # email(s) admin séparés par virgule
NEXT_PUBLIC_SITE_URL=        # URL de prod pour les liens email Supabase
```




## Développement local (docker compose)

Le backend = **API routes Next.js** (`src/app/api/`) + **Supabase** (Postgres + Auth + REST).
`docker-compose.yml` lance toute la stack : l'app en `next dev` (hot reload) + une base Supabase complète.

```bash
docker compose up -d        # ou npm run docker:up — 1er lancement : téléchargement des images + npm install
open http://localhost:3000  # compte démo enseignant + admin : demo@playperform.local / demo1234
```

| Service | URL | Rôle |
|---|---|---|
| `app` | http://localhost:3000 | Next.js dev (sources montées, hot reload) |
| `kong` | http://localhost:54321 | Passerelle Supabase (`/auth/v1`, `/rest/v1`) |
| `db` | `postgresql://postgres:postgres@localhost:54322/postgres` | Postgres 17 (image Supabase) |
| `studio` | http://localhost:54323 | Admin BDD (tables, SQL) |
| `mailpit` | http://localhost:54324 | Emails d'auth (confirmation, reset) |
| `auth`, `rest`, `meta` | — | GoTrue, PostgREST, postgres-meta (internes) |
| `db-init` | — | One-shot : applique `supabase/migrations/*.sql` non jouées + `supabase/seed.sql` au 1er lancement |

Commandes utiles :
- `npm run docker:logs` : logs de l'app · `npm run docker:down` : arrêt (la base est conservée)
- `npm run db:reset` : supprime la base et la recrée (migrations + seed)
- `npm run db:migrate` : applique une nouvelle migration (`supabase/migrations/AAAAMMJJHHMMSS_nom.sql`) sans redémarrer
- `npm run db:psql` : console SQL
- Image de prod : `docker compose --profile prod up app-prod --build` (utilise `.env.local`)

Le serveur Next (dans le conteneur) joint Supabase via `SUPABASE_INTERNAL_URL=http://kong:8000`, le navigateur via `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321` (voir `getServerSupabaseUrl()` dans `src/lib/db/client.ts`). En prod, `SUPABASE_INTERNAL_URL` est absent → URL publique.

demo@playperform.local / demo1234

## Modules (`src/modules/`, monolithe modulaire en cours)

Chaque module expose une seule API publique (`index.ts`) ; les autres modules n'importent que cet index.

```
landing ──► skills    (compétences, niveaux 1 → 5)
   ├──────► quizzes   (tests de positionnement, estimateStartLevel)
   ├──────► pricing   (abonnements, éditables en admin)
   └──────► (hors module) organizations : qui peut décider / corriger / recruter, par centre
```
- `landing` : page d'accueil visiteur — hero + CTA, choix du mode, choix de la compétence, test de niveau (5 questions), résultat sur le chemin 1 → 5, section enseignants. Résultats sans compte en localStorage (`pp:placements`).
- `skills` : 9 compétences générales (dont « Claude Platform (docs) ») collège / lycée et **4 compétences métier « Technicien de laboratoire »** (🦺 Sécurité au laboratoire, ⚗️ Solutions et dilutions, 📏 Mesures et incertitudes, 📋 Qualité et traçabilité ; champ `trade: 'laboratoire'`, chacune avec sa banque de quiz de 8 questions, son test de niveau et ses 5 consignes d'évaluation) (seed local). Une compétence métier n'apparaît ni dans le test visiteur, ni dans le défi hebdomadaire du centre ; dans la ville, seulement si le parcours de l'élève l'utilise ou s'il y a déjà un niveau. libellés des 5 niveaux, **niveau d'avancement par élève et par compétence** (ville des compétences, objectifs de date, planning de révisions repris du SRS) (l'XP reste au compte, affiché comme « Rang »), **plan de travail** par compétence (effort quotidien en minutes → date de victoire, ou date visée → minutes par jour) et **rappels quotidiens** à l'heure choisie (**Web Push**, y compris application fermée : abonnements `push_subscriptions`, envoi par `GET /api/push/dispatch` appelé toutes les 5 min ; repli sur les notifications du navigateur application ouverte), activités pour progresser (quiz, flashcards depuis les banques de questions existantes, évaluation rédigée corrigée par un examinateur). **Niveaux persistés** en base (table `skill_levels`, `GET/PUT /api/skill-levels`, jamais abaissés) et synchronisés avec l'appareil à l'entrée dans `/competences` ; le résultat du test visiteur devient le niveau de départ du premier profil qui ouvre ses compétences. API : `GET/POST /api/skill-enrollments` + `PATCH /:id` (admin) ; `POST /api/learner/login` ; `POST /api/students/:id/access-code` ; `GET/POST /api/skill-evaluations`, `PATCH /api/skill-evaluations/:id` (admin, valider relève aussi le niveau en base) ; tables `skill_evaluations`, `skill_enrollments`, `skill_levels`. `server.ts` = accès base (API routes uniquement).
- `quizzes` : 45 questions de positionnement (9 × 5 niveaux), niveau de départ = 1 + bonnes réponses (max 5).
- `dashboards` : trois tableaux de bord. **Centre** (`/enseignant`) : élèves, actifs cette semaine (actif ≤ 7 j, inactif ≤ 30 j, sinon dormant), demandes d'inscription et évaluations en attente (liens), défi de la semaine, élèves à relancer en premier ; un responsable voit tout le centre, un enseignant les élèves qu'il a ajoutés (`GET /api/dashboard/centre`). **Examinateur** (`/examinateur`, `GET /api/dashboard/examiner`). **Première connexion guidée en 3 étapes** (`FirstSteps`, remplace « Aujourd'hui » tant que le démarrage n'est pas terminé) : ① pseudo et nom (`IdentityForm`) → ② test de niveau de 5 questions dans l'app, dont le résultat devient le niveau de départ sans jamais abaisser un niveau acquis (`PlacementStep`) → ③ premier quiz (`/competences/<compétence>?activity=quiz` l'ouvre directement). Chaque étape est déduite de l'état réel (identité complète, un niveau existe, XP > 0) : rien n'est stocké et un élève qui a déjà de la progression ne repasse pas par les étapes faites. **Accueil apprenant** ensuite (haut de `/competences`, `LearnerHome`) : série, XP et « Aujourd'hui » priorisé — révisions à faire, correction à lire, réponse du centre, défi de la semaine, effort du jour, premier cours à choisir (`nextActionsFor`).
- **Centre de commande de l'apprenant** (`dashboards`, `CommandCenter` sur `/competences`) : **feuille de route en 4 phases génériques** (Fondations → Bases → Consolidation → Approfondissement) dont **les chapitres dépendent du parcours de formation** de l'élève (catalogue en base, table `training_paths`, commun à tous les centres et **édité par la société mère dans `/admin/formations`** sans toucher au code — ex. « Technicien Pharma », « Technicien Environnement » ; au départ 🎒 Réussir au collège, 🧪 Technicien(ne) de laboratoire, 📐 Mathématiques, repris de `training-paths-seed.ts` qui sert aussi de secours si la base ne répond pas). Même phase, contenus différents : « Préparer une solution et calculer une concentration » pour le laboratoire, « Fractions et nombres rationnels » en mathématiques. Un parcours retiré (« proposé aux élèves » décoché) n'est plus proposé mais reste visible de ceux qui le suivent. Le parcours est stocké sur l'élève (`students.training_path`, `GET/PUT /api/training-path`) : **le centre l'attribue ou le change** depuis la fiche de l'élève (`TrainingPathSelect`) ; sans parcours, l'élève en choisit un (une seule fois, ensuite seul le centre le change). Un chapitre = une compétence à amener à un niveau cible, avec parfois un **niveau minimum requis** dans une autre compétence (« Niveau 2 en Logique requis pour débloquer ce cours »). Trois règles, recalculées en direct depuis les niveaux (persistés en base et synchronisés à l'entrée) : ① **verrou de phase** — Phase(n) reste verrouillée tant que Phase(n-1) n'est pas complète, même si ses chapitres sont déjà atteints ; ② **filtre de niveau** — un chapitre dont le prérequis manque propose sa **remise à niveau** ; ③ **planification** — date cible = départ (premier affichage du parcours) + durées des phases, comparée à aujourd'hui (retard en rouge) et à la date réelle de complétion (enregistrées sur l'appareil par parcours, `pp:roadmap:<profil>:<parcours>`). Bandeau : ✓ vert (accomplie), violet pulsant avec « 3/5 » (en cours), gris 🔒 (à venir) ; clic = détail (chapitres, niveau requis, objectif vs réalisé). **« Reprendre mon apprentissage »** : dernière compétence ouverte si elle reste à faire dans la phase en cours (`pp:last-skill:<profil>`), sinon le chapitre suivant, et la remise à niveau si le prérequis manque ; ouvre directement le quiz (ou la page de la compétence si elle n'a pas de banque de questions). Colonne latérale : série 🔥, barre vers le rang suivant, 3 derniers badges, fil compact (réussites + Bravo, « Erreur classique détectée : 12 élèves se sont trompés sur … » anonyme, d'après `answer_stats`, pour les chapitres de la phase en cours). Sur téléphone : statut, puis carte et action, puis fil.
- `exams` (**oraux sur créneaux**, modèle repris d'app-store / freelancehub) : l'examinateur ouvre des créneaux dans un centre où il est examinateur (`exam_slots`, 30 min par défaut, 90 jours à l'avance au plus, doublons ignorés) ; l'élève **inscrit à la formation complète** de la compétence réserve un créneau libre **de son centre** (au moins 2 h avant, un oral à venir par compétence, 3 au plus) depuis la page de la compétence ; réservation et annulation **atomiques** (fonctions SQL `book_exam_slot`, `cancel_exam_booking`) ; l'élève annule jusqu'à 24 h avant (le créneau est reproposé), l'examinateur jusqu'au début (le créneau est fermé) ; après le début, l'examinateur saisit le résultat : **validé** (évaluation corrigée → niveau +1, fil d'activité), **à retravailler** (commentaire obligatoire, affiché « Presque ! »), **absent**. L'oral porte sur le niveau actuel de l'élève. API : `GET/POST /api/exam-slots`, `DELETE /api/exam-slots/:id`, `GET /api/exam-slots/open`, `GET/POST /api/exam-bookings`, `DELETE/PATCH /api/exam-bookings/:id`. **Qui fait passer les oraux** : le responsable du centre coche « Peut faire passer les oraux » pour un enseignant ou un examinateur de son centre (« Mon centre » → « Qui fait passer les oraux ? », table `oral_examiners` ; les examinateurs existants sont repris par la migration) ; seules ces personnes ouvrent des créneaux. Elles reçoivent une **notification** (bandeau sur « Mon centre » et « Mes corrections ») pour saisir leurs disponibilités tant qu'elles n'en ont aucune, et en urgence quand des élèves attendent. **Oral final sans examinateur** : un élève à partir du niveau 4 (seuil du diplôme), inscrit, sans créneau libre dans son centre, est mis automatiquement en **liste d'attente** (`oral_requests`, une par compétence) : il voit « Tu es en liste d'attente… ton centre s'occupe de te trouver un examinateur » (page de la compétence et « Aujourd'hui »), le centre voit l'alerte « n élèves attendent un examinateur » et trouve quelqu'un (créneaux ouverts par ses examinateurs, ou oraux confiés à un enseignant) ; l'élève voit les créneaux dès qu'ils s'ouvrent (« Bonne nouvelle ») et la demande se ferme quand il réserve (ou le centre la retire). API : `GET/PUT /api/oral-staff`, `GET /api/oral-examiner/status`, `GET/POST /api/oral-requests`, `GET /api/oral-requests/centre`, `DELETE /api/oral-requests/:id`. Paiement du créneau : prochaine étape (encaissement central, commission de la plateforme, reversement au centre).
- `storefront` (**vitrine des centres franchisés**) : une page publique par centre (`/centres/[slug]`, seul le nom commercial et l'adresse sont publics, jamais SIREN / SIRET) avec demande de rappel (prénom, e-mail ou téléphone, parcours, consentement ; 5 par heure et par adresse IP ; table `centre_leads`). Le centre recrute : « Mon centre » montre le lien de sa page et les demandes à rappeler (Nouvelle → Contacté → Inscrit / Sans suite). Le back-office (pédagogie, examens, diplômes, paiement) reste central. API : `POST /api/centres/:slug/leads` (public), `GET /api/centre-leads`, `PATCH /api/centre-leads/:id`.
- `certificates` (**certificats PDF vérifiables**) : émis **automatiquement** dès que l'élève est éligible au diplôme (évaluation ou oral validés, ou visite de la page du diplôme ; une fois par élève et compétence), inscrits au **registre** `certificates` avec une **signature HMAC** de tous les champs imprimés (`CERTIFICATE_SECRET`) ; champs signés figés et suppression interdite par trigger, la société mère peut seulement **révoquer** (`DELETE /api/certificates/:ref`). **PDF** A4 paysage généré côté serveur (pdf-lib) avec **QR code** vers `/verifier/<ref>?s=<signature>` (`GET /api/certificates/:ref/pdf`, titulaire ou son enseignant ; refusé une fois révoqué). Sur la page du diplôme : télécharger le PDF, **« Ajouter à mon profil LinkedIn »** (section Licences et certifications, pré-remplie) et **« Partager sur LinkedIn »** (page de vérification avec aperçu Open Graph). `GET /api/certificates?profileId&skillId`.
- `collab` (**chat de binôme**) : pendant le **projet commun** — le binôme de la semaine (`groupsOfWeek`), du lundi au lundi suivant — les membres du binôme (session apprenant uniquement, ni enseignant ni autre élève) échangent dans un chat (`/classement`, rafraîchi toutes les 5 s, 20 messages / minute) ; à la fin du projet le chat est **archivé** (lecture seule). Les messages appartiennent à Play Perform : **jamais modifiés ni supprimés** (trigger), un élève peut **signaler** un message de son binôme, et la société mère consulte **tous** les fils comme piste d'audit (`/admin/audit-chats`, noms réels + pseudos). Mention en tête du chat et dans la politique de confidentialité. Tables `chat_threads`, `chat_messages` ; API `GET /api/chat`, `POST /api/chat/messages`, `POST /api/chat/messages/:id/report`, `GET /api/audit/chats`, `GET /api/audit/chats/:id`.
- `community` : feedback d'apprentissage. **Échec constructif** (« Presque ! Voilà ce que tu viens d'apprendre », orange plutôt que rouge, jamais « Faux ») ; **statistiques anonymes** des réponses (compteurs par question et option, jamais par élève ; table `answer_stats`) → note rassurante « 45 % des élèves ont choisi la même réponse » à partir de 10 réponses et **mur des pièges classiques** du niveau sur la page d'une compétence (`GET/POST /api/stats/answers`).
- `competition` (aussi la vie sociale du centre) : **binôme de la semaine** — groupes aléatoires, identiques pour tous (graine = centre + semaine), changeant chaque semaine (évite les partenaires précédents) ; contrat : mention (≥ 4/5 au défi) pour tous les deux = +50 XP chacun, bonus réclamable une fois (`pair_bonus_claims`, XP ajouté sur l'appareil) ; **fil d'activité** des passages de niveau 4 et 5 (`activity_events`, un par élève, compétence et niveau), **Bravo 👏** (`activity_cheers`, une fois, pas sur soi, même centre), **mur des trophées** (maîtrises) ; l'enseignant retire un élément du fil ; tout en pseudonymes, masqué pour un élève retiré du classement. API : `GET/POST /api/competition/pair`, `GET /api/competition/feed`, `POST /api/competition/cheer`, `DELETE /api/competition/events/:id`. Compétition : classement du centre (**pseudonymes uniquement**, jamais les noms), défi hebdomadaire identique pour tous (compétence et questions tirées de la semaine ISO, score recalculé par le serveur, un essai par semaine), médailles automatiques 🥇🥈🥉 (≥ 3 bonnes réponses) que l'enseignant peut retirer sans que personne ne prenne la place ; l'enseignant fixe le pseudo et masque un élève du classement. API : `GET /api/competition`, `POST /api/competition/challenge`, `PUT /api/competition/profile`, `GET/DELETE /api/competition/awards` ; tables `challenge_results`, `reward_revocations`, colonnes `students.nickname` / `show_in_ranking`.
- `organizations` (catalogue, questions et tarifs **communs à tous les centres**) : société mère + centres de formation (franchise), membres et rôles (`org_admin`, `teacher`, `examiner`), permissions pures testées ; routes `GET/POST /api/organizations`, `GET/POST/DELETE /api/organizations/:id/members`, `GET /api/me` ; `server.ts` = accès base.
- `pricing` : abonnements 1 mois / 1 an / à vie (table `pricing_plans`), section « Nos abonnements » sur l'accueil, édition dans `/admin/pricing`. API : `GET /api/pricing` (public), `PUT /api/pricing/:id` (admin). `index.ts` = API client, `server.ts` = accès base (API routes uniquement).

## Versions et releases

- Version unique dans `package.json`, affichée en bas de page (lien vers `/releases`)
- `npm run release:tag -- minor --dry-run` : prévisualise la prochaine version et la note de version (commits depuis le dernier tag, groupés feat / fix / …)
- `npm run release:tag -- minor` : bump + `CHANGELOG.md` + commit + tag `vX.Y.Z` · `--push` pour publier · `--github` pour une Release GitHub (CLI `gh`)
- `release:tag` persiste aussi la note affichée sur `/releases` : `src/lib/release-notes-generated.json` (commité avec la release), titre du README synchronisé, insertion dans `release_notes` si `SUPABASE_SERVICE_ROLE_KEY` est présent (`--no-db` pour désactiver)
- `npm run release -- --title … --changes …` : note rédigée à la main en base (cas particulier)

## Déploiement

Front sur Vercel, base + backend sur le Mac mini : voir [docs/deploiement.md](docs/deploiement.md).
