import type { BankQuestion, QuizOptionId, QuizDifficulty, QuizQuestion, Subject } from '@/types';
import type { DbQuestion } from '@/lib/db';

const orUndefined = (v: string | null): string | undefined => v ?? undefined;

/** Database row → quiz question (what the quiz screens consume). */
export function dbToBankQuestion(r: DbQuestion): BankQuestion {
  return {
    skillId: r.skill_id,
    question: {
      id: r.id, subject: r.subject as Subject, category: orUndefined(r.category),
      question: r.question, questionAssisted: orUndefined(r.question_assisted),
      emoji: orUndefined(r.emoji), imageUrl: orUndefined(r.image_url),
      options: [
        { id: 'A', text: r.option_a, textAssisted: orUndefined(r.option_a_assisted) },
        { id: 'B', text: r.option_b, textAssisted: orUndefined(r.option_b_assisted) },
        { id: 'C', text: r.option_c, textAssisted: orUndefined(r.option_c_assisted) },
        { id: 'D', text: r.option_d, textAssisted: orUndefined(r.option_d_assisted) },
      ],
      correctOptionId: r.correct_option_id as QuizOptionId,
      hint: orUndefined(r.hint),
      explanation: r.explanation, explanationAssisted: orUndefined(r.explanation_assisted),
      difficulty: r.difficulty as QuizDifficulty, xpReward: r.xp_reward,
    },
  };
}

/** Built-in quiz question → published row (used to seed the database from the code banks). */
export function quizToDbRow(q: QuizQuestion, skillId: string | null): DbQuestion {
  const [a, b, c, d] = q.options;
  return {
    id: q.id, subject: q.subject, category: q.category ?? null, difficulty: q.difficulty, xp_reward: q.xpReward,
    emoji: q.emoji ?? null, image_url: q.imageUrl ?? null,
    question: q.question, question_assisted: q.questionAssisted ?? null,
    option_a: a.text, option_b: b.text, option_c: c.text, option_d: d.text,
    option_a_assisted: a.textAssisted ?? null, option_b_assisted: b.textAssisted ?? null,
    option_c_assisted: c.textAssisted ?? null, option_d_assisted: d.textAssisted ?? null,
    correct_option_id: q.correctOptionId, explanation: q.explanation, explanation_assisted: q.explanationAssisted ?? null,
    skill_id: skillId, status: 'published', hint: q.hint ?? null,
  };
}
