import type { QuizDifficulty, QuizQuestion, Subject } from '@/types';
import { getQuestions } from '@/lib/question-banks';
import type { SkillLevelNumber } from '../domain/skill';

/** Skill → existing question bank. Skills without a bank (logic, method) only offer the evaluation. */
const SKILL_SUBJECT: Record<string, Subject> = {
  'maths-fractions': 'maths',
  'francais-accords': 'francais',
  'histoire-reperes': 'histoire',
  'svt-vivant': 'svt',
  'physique-energie': 'physique',
  'anglais-comprendre': 'anglais',
};

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  explanation: string;
}

export function getSkillSubject(skillId: string): Subject | null {
  return SKILL_SUBJECT[skillId] ?? null;
}

/** Levels 1-5 map onto the 4 quiz difficulties (levels 4 and 5 both use "Gourou"). */
export function difficultyForLevel(level: SkillLevelNumber): QuizDifficulty {
  return Math.min(4, level) as QuizDifficulty;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Questions of the skill's subject; the level's difficulty first, then the closest ones. */
export function pickSkillQuestions(
  skillId: string, level: SkillLevelNumber, count: number, random: () => number = Math.random,
): QuizQuestion[] {
  const subject = getSkillSubject(skillId);
  if (!subject) return [];
  const target = difficultyForLevel(level);
  const byCloseness = shuffle(getQuestions(subject), random)
    .sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target));
  return byCloseness.slice(0, count);
}

export function toFlashcards(questions: QuizQuestion[]): Flashcard[] {
  return questions.map((q) => ({
    id: q.id,
    front: q.question,
    back: q.options.find((o) => o.id === q.correctOptionId)?.text ?? '',
    explanation: q.explanation,
  }));
}
