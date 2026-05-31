import type { QuizQuestion, Subject } from '@/types';
import { ALL_QUESTIONS } from '@/lib/question-banks';

// For legacy compatibility
export function getQuizQuestions(subject: Subject, count = 4): QuizQuestion[] {
  const pool = ALL_QUESTIONS[subject] ?? [];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export const QUIZ_SUBJECTS: Subject[] = [
  'maths', 'francais', 'svt', 'histoire', 'physique',
];

export const ALL_QUIZ_SUBJECTS: Subject[] = [
  'maths', 'francais', 'svt', 'histoire', 'physique',
  'espace', 'meteo', 'chimie', 'mecanique', 'geo',
  'anglais', 'espagnol', 'informatique', 'telecom',
];

export function getSubjectLabel(subject: Subject): string {
  const labels: Record<Subject, string> = {
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
  return labels[subject];
}
