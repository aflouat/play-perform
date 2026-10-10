import type { QuizQuestion } from '@/types';
import { getSkillBank, getSkills, hasQuestionBank, isGeneralSkill } from '@/modules/skills';
import { hash32, seededRandom } from '../domain/seed';

export const CHALLENGE_LENGTH = 5;

export interface WeeklyChallenge { week: string; skillId: string; questions: QuizQuestion[] }
export interface ChallengeAnswer { questionId: string; optionId: string }

/** The challenge of a week: same skill and same questions for everyone, whatever the device (seeded by the week). */
export function challengeFor(week: string): WeeklyChallenge {
  // Same challenge for the whole centre: general skills only (trade skills belong to some training paths)
  const skills = getSkills().filter((s) => isGeneralSkill(s) && hasQuestionBank(s.id));
  const skill = skills[hash32(`skill:${week}`) % skills.length];
  const random = seededRandom(hash32(`questions:${week}`));
  const pool = [...getSkillBank(skill.id)].sort((a, b) => a.id.localeCompare(b.id));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { week, skillId: skill.id, questions: pool.slice(0, CHALLENGE_LENGTH) };
}

/** Correct answers recomputed from the real questions: each question counts once, the first answer wins. */
export function scoreChallenge(questions: readonly QuizQuestion[], answers: readonly ChallengeAnswer[]): { correct: number; total: number } {
  const firstAnswer = new Map<string, string>();
  for (const a of answers) if (!firstAnswer.has(a.questionId)) firstAnswer.set(a.questionId, a.optionId);
  const correct = questions.filter((q) => firstAnswer.get(q.id) === q.correctOptionId).length;
  return { correct, total: questions.length };
}
