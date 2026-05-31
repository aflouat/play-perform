# SYNTH.EDU — Play Perform

Plateforme d'apprentissage gamifiée pour enfants. Trois profils actifs :

| Profil | Âge | Activité |
|---|---|---|
| 🧑‍🎓 **Omar** | 12 ans, 6ème | Quiz brevet (maths, français, SVT, histoire, physique) |
| 🌸 **Esma** | 9 ans, CP adapté | Mots illustrés en FR / EN / ES |
| 🚀 **Mohamed** | 6 ans, CP | Clavier (lettres), mots à taper, découverte sciences |

## Stack
- Next.js 16.2.6 · App Router · TypeScript strict · Tailwind v4
- Tests : Jest 30 + Testing Library + Playwright (e2e)
- Audio : Web Audio API (sons) + SpeechSynthesis (voix enthousiaste)

## Routes
| Route | Description |
|---|---|
| `/` | Sélection de profil |
| `/home` | Dashboard Omar (quiz par matière) |
| `/quiz/[subject]` | Quiz interactif (XP animé, sons, TTS) |
| `/keyboard` | Jeu Mohamed : Lettres / Mots / Sciences |
| `/esma` | Jeu Esma : mots illustrés multilingue |

## Architecture
```
src/
├── app/              # Routes Next.js (page.tsx par route)
├── components/
│   ├── keyboard/     # LetterMode, WordMode, ScienceMode
│   ├── shared/       # QuizCard, AvatarPicker
│   └── ui/           # AvatarCard, ScoreBadge, BrickGauge, XpGainToast
├── hooks/            # useEngagement, useScore, useAvatar
├── lib/              # avatars, keyboard-data, phrase-data, quiz-data, science-data, word-data, audio, profiles
└── types/            # index.ts (strict, no any)
```

## Règles de code
- Max 150 lignes par fichier
- TypeScript strict — `any` interdit
- TDD pour les hooks complexes
- Sons : Web Audio API (tones) + SpeechSynthesis enthousiaste

## Commandes
```bash
npm run dev           # Dev server
npm run build         # Build prod
npm run test          # Tests unit + intégration (50 tests)
npm run test:coverage # Avec couverture
npm run test:e2e      # E2E Playwright
```

## État des tests
50/50 tests passent · TypeScript strict : 0 erreur · Build : 6 routes propres
