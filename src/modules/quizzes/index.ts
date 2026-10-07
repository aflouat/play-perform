/** Public API of the quizzes module (minimal POC version: placement tests). */
import { PLACEMENT_BANK_A } from './infra/placement-bank-a';
import { PLACEMENT_BANK_B } from './infra/placement-bank-b';
import type { PlacementQuestion } from './domain/placement';

export type { PlacementLevel, PlacementQuestion, PlacementAnswer, PlacementResult } from './domain/placement';
export { scoreAnswer, estimateStartLevel } from './domain/placement';

const BANK: readonly PlacementQuestion[] = [...PLACEMENT_BANK_A, ...PLACEMENT_BANK_B];

/** Placement test of a skill: one question per level, from level 1 to 5. */
export function getPlacementTest(skillId: string): PlacementQuestion[] {
  return BANK.filter((question) => question.skillId === skillId).sort((a, b) => a.level - b.level);
}
