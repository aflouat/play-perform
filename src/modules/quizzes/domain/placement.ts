/** Placement test: one question per level 1 → 5, used to pick a starting level. */
export type PlacementLevel = 1 | 2 | 3 | 4 | 5;

export interface PlacementQuestion {
  id: string;
  skillId: string;
  level: PlacementLevel;
  prompt: string;
  options: readonly string[];
  correctIndex: number;
}

export interface PlacementAnswer {
  questionId: string;
  level: PlacementLevel;
  correct: boolean;
  /** "Je ne sais pas" */
  skipped: boolean;
}

export interface PlacementResult {
  startLevel: PlacementLevel;
  correct: number;
  skipped: number;
  total: number;
  /** Every question answered correctly */
  mastered: boolean;
}

/** `chosenIndex === null` means the learner chose "Je ne sais pas". */
export function scoreAnswer(question: PlacementQuestion, chosenIndex: number | null): PlacementAnswer {
  return {
    questionId: question.id,
    level: question.level,
    correct: chosenIndex === question.correctIndex,
    skipped: chosenIndex === null,
  };
}

/**
 * Starting level = 1 + number of correct answers, capped at 5.
 * Equivalent to "first level not acquired" when answers are consistent,
 * and tolerant of a single slip on an easy question.
 */
export function estimateStartLevel(answers: readonly PlacementAnswer[]): PlacementResult {
  const correct = answers.filter((a) => a.correct).length;
  const skipped = answers.filter((a) => a.skipped).length;
  const total = answers.length;
  return {
    startLevel: Math.min(5, 1 + correct) as PlacementLevel,
    correct,
    skipped,
    total,
    mastered: total > 0 && correct === total,
  };
}
