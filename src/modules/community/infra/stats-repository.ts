import { getServerClient } from '@/lib/db/client';

export interface AnsweredQuestion { questionId: string; optionId: string }

const QUESTION_ID = /^[A-Za-z0-9_-]{1,60}$/;

export const isValidAnswer = (a: unknown): a is AnsweredQuestion =>
  typeof a === 'object' && a !== null
  && QUESTION_ID.test((a as AnsweredQuestion).questionId ?? '')
  && ['A', 'B', 'C', 'D'].includes((a as AnsweredQuestion).optionId);

/** Server-side only (service role). Counts per option: nothing identifies the learner. */
export async function recordAnswers(answers: readonly AnsweredQuestion[]): Promise<void> {
  const db = getServerClient();
  await Promise.all(answers.map((a) => db.rpc('bump_answer_stat', { p_question: a.questionId, p_option: a.optionId })));
}

export async function loadDistributions(questionIds: readonly string[]): Promise<Record<string, Record<string, number>>> {
  if (questionIds.length === 0) return {};
  const { data, error } = await getServerClient().from('answer_stats').select('question_id, option_id, count').in('question_id', [...questionIds]);
  if (error) throw new Error(error.message);
  const result: Record<string, Record<string, number>> = {};
  for (const row of (data ?? []) as { question_id: string; option_id: string; count: number }[]) {
    (result[row.question_id] ??= {})[row.option_id] = Number(row.count);
  }
  return result;
}
