#  Play Perform · v0.5.3

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
│   ├── question-banks/   # ~200+ questions (100+ brevet + autres sujets)
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
npm run test          # 62 tests
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

## État · v0.5.3

- ✅ 62/62 tests · TypeScript strict 0 erreur · Build propre
- ✅ Auth parent (inscription, connexion, reset mot de passe, activation email)
- ✅ CRUD élèves via API server-side (bypass RLS, fallback sans service key)
- ✅ Mode selector sessionnel (activité libre à chaque session)
- ✅ Quiz SRS SM-2 + sablier 30s + XP décroissants
- ✅ **100+ questions brevet** pour Omar (Math, Français, HG, SVT, Physique-Chimie, Anglais, Espagnol)
- ✅ Import questions CSV + édition admin
- ✅ Release notes Supabase + page /releases

#  Play Perform — Rôles Agentiques

Ce fichier est la Source of Truth pour tout agent qui interagit avec ce repo.
Jamais de code sans lire `in-progress.md` d'abord. Jamais de modification sans mettre à jour `README.md`, `todo.md` et `in-progress.md`.

## Agent RESP (Responsable)
- Lit et écrit `todo.md` (roadmap d'intentions)
- Décide quelle Epic démarrer
- Crée / met à jour `in-progress.md` avec le maximum de contexte
- Vérifie que le `README.md` reflète la vérité du repo à tout moment
- Peut déléguer le code à l'Agent CODEUR
- NE CODE PAS directement sauf si pas d'autre agent dispo

## Agent CODEUR (Exécutant)
- LIT IMPERATIVEMENT `in-progress.md` avant toute ligne de code
- LIT `README.md` pour comprendre l'état actuel du système
- Code les tâches décrites dans `in-progress.md`
- Respecte la contrainte 150 lignes/fichier
- Respecte TypeScript strict, pas de `any`
- Met à jour `README.md` à la fin de chaque Epic pour refléter les changements
- Marque les tâches `in-progress.md` comme terminées au fur et à mesure
- Peut signaler un blocage dans `in-progress.md` pour transfert à un autre agent

## Règles de mise à jour des fichiers
`README.md` : mis à jour à chaque fin d'Epic pour refléter l'état tech + features
`todo.md` : le RESP gère, ajoute/modifie des intentions, repriorise
`in-progress.md` : vivant, mis à jour en continu, effacé quand l'Epic est finie

## Cible1 : Omar
- 12 ans, très bon en 6ème, veut sauter la 5ème
- Objectif : brevet en 1er du collège
- Projets futurs : médecin OU data scientist
- Le produit doit être ludique, auto-adaptatif, et orienté progression rapide.

## Cible2 : Esma
- 9 ans, a des troubles d'apprentissage et de langage, niveau CP adapté, aime repeter des petites phrases en anglais ou espagnole
- Objectif : apprentissage ludique
- Projets futurs : développer son autonomie, lecture et écriture, ordinateur
- Le produit doit être ludique, auto-adaptatif, et orienté progression rapide.


## Cible3 : Mohamed
- 6 ans, curieux, réflechi, calculateur, en classe CP avancé
- Objectif : apprendre à taper sur le clavier, découvrir, étonnement, questions, dévinettes
- Projets futurs : exploration scientifique et litérraire

