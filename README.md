# SYNTH.EDU — Play Perform · v0.5.1

Plateforme d'apprentissage ludique pour enfants. Le parent crée un compte, ajoute ses élèves, et chaque enfant joue dans le mode adapté à son profil.

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
| `/home` | Dashboard quiz Omar (toutes matières) |
| `/quiz/[subject]` | Quiz interactif avec sablier 30s et XP décroissants |
| `/esma` | Jeu Esma — mots illustrés FR/EN/ES (mode assisté par défaut) |
| `/keyboard` | Jeu Mohamed — Lettres / Mots / Sciences |
| `/admin/import` | Import questions CSV (admin) |
| `/admin/questions` | Liste et édition questions importées (admin) |
| `/releases` | Historique des versions (recherche date / version / fulltext) |
| `/faq` | Guide utilisateur |

## Modes de jeu

| Mode | Route | Profil type |
|---|---|---|
| 📚 Quiz | `/home` → `/quiz/[subject]` | Omar, 12 ans |
| 🌸 Mots | `/esma` | Esma, 9 ans (mode assisté) |
| ⌨️ Clavier | `/keyboard` | Mohamed, 6 ans |

Le parent choisit l'activité par défaut de chaque élève. En cliquant sur un profil, un **mode selector** propose les 3 activités — le mode par défaut est mis en valeur mais peut être changé pour cette session uniquement.

## Architecture

```
src/
├── app/
│   ├── (public)          # /, /auth, /faq, /releases
│   ├── admin/            # /admin/import, /admin/questions
│   ├── api/              # /api/students, /api/questions, /api/releases
│   ├── esma/             # Jeu mots
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
│   ├── db/               # client, scores, questions, students, releases
│   ├── question-banks/   # ~130 questions statiques (14 matières)
│   ├── admin-auth.ts     # isAdminAuthorized (JWT Supabase + ADMIN_EMAILS)
│   ├── students-api.ts   # Client → /api/students (bypass RLS)
│   ├── learning-mode.ts  # LearningMode, STUDENT_MODE_LABELS
│   └── spaced-repetition.ts # Algorithme SM-2
└── types/                # index.ts (User, Subject, Quiz, Score, SRS)
```

## Stack

- Next.js 16.2.6 · App Router · TypeScript strict · Tailwind v4
- Supabase (Auth + DB) · localStorage (scores + progression SRS)
- Jest 30 + Testing Library + Playwright

## Commandes

```bash
npm run dev           # Dev server
npm run build         # Build prod
npm run test          # 63 tests
npm run test:e2e      # E2E Playwright
npm run release -- --title "..." --changes "A,B,C"
```

## Variables d'environnement

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # optionnel, améliore la fiabilité des inserts
ADMIN_EMAILS=                # email(s) admin séparés par virgule
NEXT_PUBLIC_SITE_URL=        # URL de prod pour les liens email Supabase
```

## État · v0.5.1

- ✅ 63/63 tests · TypeScript strict 0 erreur · Build propre
- ✅ Auth parent (inscription, connexion, reset mot de passe, activation email)
- ✅ CRUD élèves via API server-side (bypass RLS, fallback sans service key)
- ✅ Mode selector sessionnel (activité libre à chaque session)
- ✅ Quiz SRS SM-2 + sablier 30s + XP décroissants
- ✅ Import questions CSV + édition admin
- ✅ Release notes Supabase + page /releases
