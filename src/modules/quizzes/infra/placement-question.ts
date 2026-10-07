import type { PlacementLevel, PlacementQuestion } from '../domain/placement';

/** Compact builder for seed questions. */
export function q(skillId: string, level: PlacementLevel, prompt: string, options: string[], correctIndex: number): PlacementQuestion {
  return { id: `${skillId}-${level}`, skillId, level, prompt, options, correctIndex };
}
