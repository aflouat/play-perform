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



