import type { Subject } from '@/types';

/**
 * Source unique de vérité pour les matières.
 * - SUBJECT_META : emoji + couleur de fond (une seule palette, teintes -500)
 * - ALL_SUBJECT_IDS : toutes les matières valides du type Subject (utilisé à l'import CSV)
 * - NAV_SUBJECTS : matières disposant d'une banque de questions (affichées dans la navigation)
 *
 * Note : 'it' et 'culture' restent des matières valides à l'import mais n'ont pas
 * encore de banque de questions, donc elles sont hors NAV_SUBJECTS.
 */
export const SUBJECT_META: Record<Subject, { emoji: string; bg: string }> = {
  maths: { emoji: '🧮', bg: 'bg-sky-500' },
  francais: { emoji: '📝', bg: 'bg-violet-500' },
  svt: { emoji: '🔬', bg: 'bg-emerald-500' },
  histoire: { emoji: '🏛️', bg: 'bg-amber-500' },
  physique: { emoji: '⚡', bg: 'bg-rose-500' },
  it: { emoji: '💻', bg: 'bg-cyan-500' },
  culture: { emoji: '🌍', bg: 'bg-teal-500' },
  espace: { emoji: '🚀', bg: 'bg-indigo-500' },
  meteo: { emoji: '🌦️', bg: 'bg-cyan-400' },
  chimie: { emoji: '⚗️', bg: 'bg-lime-500' },
  mecanique: { emoji: '⚙️', bg: 'bg-orange-500' },
  geo: { emoji: '🗺️', bg: 'bg-teal-500' },
  anglais: { emoji: '🇬🇧', bg: 'bg-blue-500' },
  espagnol: { emoji: '🇪🇸', bg: 'bg-red-500' },
  informatique: { emoji: '💻', bg: 'bg-slate-500' },
  telecom: { emoji: '📡', bg: 'bg-purple-500' },
};

export const ALL_SUBJECT_IDS = Object.keys(SUBJECT_META) as Subject[];

export const NAV_SUBJECTS: Subject[] = [
  'maths', 'francais', 'svt', 'histoire', 'physique',
  'espace', 'meteo', 'chimie', 'mecanique', 'geo',
  'anglais', 'espagnol', 'informatique', 'telecom',
];

const SUBJECT_LABELS: Record<Subject, string> = {
  maths: 'Mathématiques',
  francais: 'Français',
  svt: 'SVT',
  histoire: 'Histoire-Géo',
  physique: 'Physique-Chimie',
  it: 'Informatique',
  culture: 'Culture générale',
  espace: 'Espace',
  meteo: 'Météo',
  chimie: 'Chimie',
  mecanique: 'Mécanique',
  geo: 'Géographie',
  anglais: 'Anglais',
  espagnol: 'Espagnol',
  informatique: 'Informatique',
  telecom: 'Télécom',
};

export function getSubjectLabel(subject: Subject): string {
  return SUBJECT_LABELS[subject];
}

export function isValidSubject(s: string): s is Subject {
  return (ALL_SUBJECT_IDS as string[]).includes(s);
}
