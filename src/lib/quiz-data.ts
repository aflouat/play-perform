import type { QuizQuestion, Subject } from '@/types';
import { ALL_QUESTIONS } from '@/lib/question-banks';
import { NAV_SUBJECTS, getSubjectLabel } from '@/lib/subjects';

// For legacy compatibility
export function getQuizQuestions(subject: Subject, count = 4): QuizQuestion[] {
  const pool = ALL_QUESTIONS[subject] ?? [];
  return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export const QUIZ_SUBJECTS: Subject[] = [
  'maths', 'francais', 'svt', 'histoire', 'physique',
];

// Dérivé de la source unique src/lib/subjects.ts
export const ALL_QUIZ_SUBJECTS: Subject[] = NAV_SUBJECTS;

export { getSubjectLabel };
