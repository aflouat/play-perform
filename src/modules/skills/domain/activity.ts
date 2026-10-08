import type { SkillLevelNumber } from './skill';

/** Ways a learner can raise a skill level. */
export type SkillActivity = 'quiz' | 'flashcards' | 'evaluation';

export const QUIZ_LENGTH = 5;
/** Correct answers needed to pass a skill quiz (4 out of 5). */
export const QUIZ_PASS_COUNT = 4;
export const QUIZ_PASS_XP = 30;
export const FLASHCARDS_XP = 10;

export function isQuizPassed(correct: number, total: number): boolean {
  return total > 0 && correct >= Math.min(QUIZ_PASS_COUNT, total);
}

/** Level after a quiz: +1 on success (cap 5). A learner never evaluated is treated as level 1. */
export function nextLevelAfterQuiz(current: SkillLevelNumber | null, passed: boolean): SkillLevelNumber {
  const from = current ?? 1;
  return (passed ? Math.min(5, from + 1) : from) as SkillLevelNumber;
}
