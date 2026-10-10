import type { QuizDifficulty, QuizOptionId, QuizQuestion, Subject } from '@/types';
import { DIFFICULTY_META } from '@/types';

const IDS: QuizOptionId[] = ['A', 'B', 'C', 'D'];

/** Compact builder for a skill's own question bank: the right answer is given by its index. */
export function bankQuestion(
  id: string, subject: Subject, emoji: string, difficulty: QuizDifficulty,
  question: string, options: [string, string, string, string], correct: number, explanation: string,
): QuizQuestion {
  return {
    id, subject, emoji, question,
    options: options.map((text, i) => ({ id: IDS[i], text })) as QuizQuestion['options'],
    correctOptionId: IDS[correct], explanation, difficulty, xpReward: DIFFICULTY_META[difficulty].xpBase,
  };
}
