import type { DbReleaseNote } from '@/lib/db';

// Historique statique — fallback si Supabase non configuré
export const STATIC_RELEASE_NOTES: DbReleaseNote[] = [
  {
    id: 'static-v0.2.0',
    version: '0.2.0',
    deployed_at: '2026-05-31T00:00:00Z',
    title: 'Import CSV + 4 niveaux de difficulté + Release Notes',
    summary: 'Système d\'import de questions via CSV ou API, 4 niveaux de difficulté (Initié → Gourou), versions assistée/avancée par question, page de release notes.',
    changes: [
      'Import questions via CSV (POST /api/questions/import)',
      '4 niveaux de difficulté : Initié 🌱, Apprenti 📖, Expert ⚡, Gourou 🔥',
      'Champ questionAssisted + explanationAssisted + textAssisted par option',
      'Champ imageUrl optionnel par question',
      'Champ category optionnel par question',
      'Table Supabase questions pour les questions importées',
      'Page admin /admin/import avec dropzone CSV',
      'Système de release notes (table + page /releases + script npm run release)',
      'CLAUDE.md : index des .md + règles de versionnement SemVer',
    ],
    tags: ['feature', 'admin', 'docs'],
    deployed_by: 'Claude Code',
  },
  {
    id: 'static-v0.1.0',
    version: '0.1.0',
    deployed_at: '2026-05-30T00:00:00Z',
    title: 'Initial Release — Sons, Score, Mohamed, Quiz',
    summary: 'Premier déploiement avec les trois profils actifs : Omar (quiz), Esma (mots illustrés), Mohamed (clavier/mots/sciences).',
    changes: [
      'Quiz interactif par matière (maths, français, SVT, histoire, physique + 9 autres)',
      'Spaced repetition (algorithme SM-2) pour Omar',
      'Sons enthousiastes (Web Audio API + SpeechSynthesis)',
      'XpGainToast : badge "+N XP" flottant animé',
      'Mohamed — 3 modes : LetterMode, WordMode, ScienceMode',
      'Esma — mots illustrés FR/EN/ES avec TTS',
      'Sélecteur d\'avatar (6 avatars, déblocage XP)',
      'Score + badges + streak (localStorage + sync Supabase)',
      '50 tests Jest + e2e Playwright',
    ],
    tags: ['feature'],
    deployed_by: 'Claude Code',
  },
];
