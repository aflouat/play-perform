#  Play Perform · v0.6.0

Plateforme d'apprentissage ludique pour enfants. Le parent crée un compte, ajoute ses élèves, et chaque enfant joue dans le mode adapté à son profil. la ptf dispose d'un acces admin pour gerer les questions sur la GUI et ou batch API / CSV

## Authentification

| Rôle | Accès |
|---|---|
| Parent | S'inscrit sur `/auth`, gère ses élèves sur `/parent` |
| Élève | Sélectionné depuis la page d'accueil par le parent |
| Admin | Email dans `ADMIN_EMAILS` → accès `/admin/*` |

## Routes

| Route | Description |
|---|---|
| `/` | Accueil — liste des élèves (auth parent obligatoire) |
| `/auth` | Connexion / Inscription / Mot de passe oublié |
| `/auth/confirm` | Activation de compte (lien email) |
| `/auth/reset-password` | Réinitialisation mot de passe |
| `/parent` | Gestion des élèves (add / edit / delete) |
| `/home` | Dashboard quiz eleve (toutes matières) |
| `/quiz/[subject]` | Quiz interactif avec sablier 30s et XP décroissants |
| `/keyboard` | Jeu d'enfant initié — Lettres / Mots / Sciences /Mots illustrés FR/EN/ES|
| `/admin/import` | Import questions CSV (admin) |
| `/admin/questions` | Liste et édition questions importées (admin) |
| `/releases` | Historique des versions (recherche date / version / fulltext) |
| `/faq` | Guide utilisateur |
| `/parcours/[id]` | Session de jeu d'un parcours multi-discipline |
| `/admin/parcours` | Gestion des parcours (admin) |
| `/admin/parcours/[id]` | Édition parcours + inscriptions élèves (admin) |

## Modes de jeu

| Mode | Route | Profil type |
|---|---|---|
| 📚 Quiz | `/home` → `/quiz/[subject]` | college |
| ⌨️ Clavier | `/keyboard` | Elemenetaire avec mode assisté activable |

Le parent choisit l'activité par défaut de chaque élève. En cliquant sur un profil, un **mode selector** propose les 2 activités — le mode par défaut est mis en valeur mais peut être changé pour cette session uniquement.

## Architecture

```
src/
├── app/
│   ├── (public)          # /, /auth, /faq, /releases
│   ├── admin/            # /admin/import, /admin/questions
│   ├── api/              # /api/students, /api/questions, /api/releases
│   ├── home/             # Dashboard quiz
│   ├── keyboard/         # Jeu clavier/sciences
│   ├── parent/           # Gestion élèves
│   └── quiz/[subject]/   # Quiz interactif
├── components/
│   ├── admin/            # ImportDropzone
│   ├── keyboard/         # LetterMode, WordMode, ScienceMode
│   ├── parent/           # StudentCard
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
SUPABASE_SERVICE_ROLE_KEY=   # optionnel, améliore la fiabilité des inserts
ADMIN_EMAILS=                # email(s) admin séparés par virgule
NEXT_PUBLIC_SITE_URL=        # URL de prod pour les liens email Supabase
```




## Développement local (docker compose)

Le backend = **API routes Next.js** (`src/app/api/`) + **Supabase** (Postgres + Auth + REST).
`docker-compose.yml` lance toute la stack : l'app en `next dev` (hot reload) + une base Supabase complète.

```bash
docker compose up -d        # ou npm run docker:up — 1er lancement : téléchargement des images + npm install
open http://localhost:3000  # compte démo parent + admin : demo@playperform.local / demo1234
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
