import type { QuizQuestion } from './index';

export type QuestionStatus = 'draft' | 'published';

/** A question published from the database; `skillId` null = it follows its school subject. */
export interface BankQuestion {
  skillId: string | null;
  question: QuizQuestion;
}
