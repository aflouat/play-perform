import type { QuizQuestion } from '@/types';
import { initProgress, loadProgressMap, saveProgressMap, updateProgress } from '@/lib/spaced-repetition';
import { summarizeReviews, type ReviewSummary } from '../domain/dashboard';
import { getSkillBank } from './skill-content';

/** Records an answer in the learner's spaced-repetition schedule (same store as the subject quizzes). */
export function recordSkillAnswer(profileId: string, question: QuizQuestion, isCorrect: boolean): void {
  const map = loadProgressMap(profileId, question.subject);
  const previous = map[question.id] ?? initProgress(question.id, profileId);
  saveProgressMap(profileId, question.subject, { ...map, [question.id]: updateProgress(previous, isCorrect) });
}

/** Past and upcoming reviews of the questions that belong to a skill. */
export function loadSkillReviews(profileId: string, skillId: string, now: Date): ReviewSummary {
  const bank = getSkillBank(skillId);
  const ids = new Set(bank.map((q) => q.id));
  const progress = Object.fromEntries(
    [...new Set(bank.map((q) => q.subject))].flatMap((subject) =>
      Object.entries(loadProgressMap(profileId, subject)).filter(([id]) => ids.has(id))),
  );
  return summarizeReviews(progress, now);
}
