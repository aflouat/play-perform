/** Public API of the quizzes module (minimal POC version: placement tests). */
import { PLACEMENT_BANK_A } from './infra/placement-bank-a';
import { PLACEMENT_BANK_B } from './infra/placement-bank-b';
import { PLACEMENT_BANK_C } from './infra/placement-bank-c';
import { PLACEMENT_BANK_D } from './infra/placement-bank-d';
import type { PlacementQuestion } from './domain/placement';

export type { PlacementLevel, PlacementQuestion, PlacementAnswer, PlacementResult, ReviewEntry } from './domain/placement';
export { scoreAnswer, estimateStartLevel, reviewAnswers } from './domain/placement';

const BANK: readonly PlacementQuestion[] = [...PLACEMENT_BANK_A, ...PLACEMENT_BANK_B, ...PLACEMENT_BANK_C, ...PLACEMENT_BANK_D];

/** Placement test of a skill: one question per level, from level 1 to 5. */
export function getPlacementTest(skillId: string): PlacementQuestion[] {
  return BANK.filter((question) => question.skillId === skillId).sort((a, b) => a.level - b.level);
}
