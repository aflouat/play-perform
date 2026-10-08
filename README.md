#  Play Perform · v0.9.0

Plateforme d'apprentissage ludique pour les ados & jeunes. L'enseignant (ou le tuteur / adulte responsable) crée un compte, ajoute ses élèves et leur donne un **code d'accès** ; chaque apprenant ouvre alors ses compétences sur `/apprenant` — plus aucun élève « démo » n'est ajouté d'office. la ptf dispose d'un acces admin pour gerer les questions sur la GUI et ou batch API / CSV

## Authentification

| Rôle | Accès |
|---|---|
| Enseignant | S'inscrit sur `/auth`, ajoute ses élèves et génère leur code d'accès sur `/enseignant` |
| Apprenant | Saisit son code (8 caractères) sur `/apprenant` → session signée de 30 jours sur son appareil ; accède à ses compétences uniquement |
| Super admin (société mère) | Email dans `ADMIN_EMAILS` ou table `platform_admins` → crée les centres, voit tout |
| Responsable de centre / enseignant / examinateur | Rôles dans `memberships` (un examinateur peut appartenir à plusieurs centres) : le centre décide des inscriptions de ses élèves, l'examinateur corrige leurs évaluations — voir [docs/saas-franchise.md](docs/saas-franchise.md) |

Avant de travailler un cours, l'apprenant lit sa **fiche** et présente une **demande d'inscription** avec ses motivations ; le centre l'accepte ou la refuse. Un niveau déjà acquis (test de niveau) vaut inscription.

## Routes

| Route | Description |
|---|---|
| `/` | Visiteur : page d'accueil (mode sans compte / avec compte, choix d'une compétence, test de niveau) · Enseignant connecté : liste des élèves |
| `/auth` | Connexion / Inscription / Mot de passe oublié |
| `/auth/confirm` | Activation de compte (lien email) |
| `/auth/reset-password` | Réinitialisation mot de passe |
| `/enseignant`, `/enseignant/new` | Espace enseignant : gestion des élèves (ajout / édition / suppression) et de leur code d'accès (`/parent` redirige ici) |
| `/apprenant` | Espace apprenant : saisie du code d'accès |
| `/competences/[skillId]/fiche` | Fiche du cours + demande d'inscription (motivations) |
| `/admin/inscriptions` | Centre : accepter / refuser les demandes d'inscription de ses élèves |
| `/admin/organisations` | Super admin : créer des centres ; responsable de centre : recruter enseignants et examinateurs |
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
| `/competences` | Élève : « ville des compétences » (un bâtiment par compétence, qui grandit avec le niveau) ; au clic : barre vers la maîtrise, révisions passées / à venir, objectif de date |
| `/confidentialite` | Politique de confidentialité (données des mineurs) |
| `/competences/[skillId]` | Niveau de la compétence + activités pour monter : Quiz (4/5 = niveau suivant), Flashcards, Évaluation rédigée |
| `/admin/evaluations` | Examinateur (admin) : correction des évaluations rédigées (valider = +1 niveau) |
| `/admin/pricing` | Tarifs des abonnements 1 mois / 1 an / à vie (admin) |

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
- `skills` : 9 compétences (dont « Claude Platform (docs) ») collège / lycée (seed local), libellés des 5 niveaux, **niveau d'avancement par élève et par compétence** (ville des compétences, objectifs de date, planning de révisions repris du SRS) (l'XP reste au compte, affiché comme « Rang »), **plan de travail** par compétence (effort quotidien en minutes → date de victoire, ou date visée → minutes par jour) et **rappels quotidiens** à l'heure choisie (**Web Push**, y compris application fermée : abonnements `push_subscriptions`, envoi par `GET /api/push/dispatch` appelé toutes les 5 min ; repli sur les notifications du navigateur application ouverte), activités pour progresser (quiz, flashcards depuis les banques de questions existantes, évaluation rédigée corrigée par un examinateur). **Niveaux persistés** en base (table `skill_levels`, `GET/PUT /api/skill-levels`, jamais abaissés) et synchronisés avec l'appareil à l'entrée dans `/competences` ; le résultat du test visiteur devient le niveau de départ du premier profil qui ouvre ses compétences. API : `GET/POST /api/skill-enrollments` + `PATCH /:id` (admin) ; `POST /api/learner/login` ; `POST /api/students/:id/access-code` ; `GET/POST /api/skill-evaluations`, `PATCH /api/skill-evaluations/:id` (admin, valider relève aussi le niveau en base) ; tables `skill_evaluations`, `skill_enrollments`, `skill_levels`. `server.ts` = accès base (API routes uniquement).
- `quizzes` : 45 questions de positionnement (9 × 5 niveaux), niveau de départ = 1 + bonnes réponses (max 5).
- `organizations` : société mère + centres de formation (franchise), membres et rôles (`org_admin`, `teacher`, `examiner`), permissions pures testées ; routes `GET/POST /api/organizations`, `GET/POST/DELETE /api/organizations/:id/members`, `GET /api/me` ; `server.ts` = accès base.
- `pricing` : abonnements 1 mois / 1 an / à vie (table `pricing_plans`), section « Nos abonnements » sur l'accueil, édition dans `/admin/pricing`. API : `GET /api/pricing` (public), `PUT /api/pricing/:id` (admin). `index.ts` = API client, `server.ts` = accès base (API routes uniquement).

## Versions et releases

- Version unique dans `package.json`, affichée en bas de page (lien vers `/releases`)
- `npm run release:tag -- minor --dry-run` : prévisualise la prochaine version et la note de version (commits depuis le dernier tag, groupés feat / fix / …)
- `npm run release:tag -- minor` : bump + `CHANGELOG.md` + commit + tag `vX.Y.Z` · `--push` pour publier · `--github` pour une Release GitHub (CLI `gh`)
- `release:tag` persiste aussi la note affichée sur `/releases` : `src/lib/release-notes-generated.json` (commité avec la release), titre du README synchronisé, insertion dans `release_notes` si `SUPABASE_SERVICE_ROLE_KEY` est présent (`--no-db` pour désactiver)
- `npm run release -- --title … --changes …` : note rédigée à la main en base (cas particulier)

## Déploiement

Front sur Vercel, base + backend sur le Mac mini : voir [docs/deploiement.md](docs/deploiement.md).
