/** A skill the learner can acquire, shown as a star of the constellation. */
export interface Skill {
  id: string;
  name: string;
  description: string;
  /** Subject area, e.g. "Mathématiques" */
  domain: string;
  emoji: string;
}

export type SkillLevelNumber = 1 | 2 | 3 | 4 | 5;

export interface SkillLevelInfo {
  n: SkillLevelNumber;
  label: string;
  description: string;
}

/** The 5 levels of every skill path (1 → 5). */
export const SKILL_LEVELS: readonly SkillLevelInfo[] = [
  { n: 1, label: 'Découverte', description: 'Les notions de base' },
  { n: 2, label: 'Bases', description: 'Les automatismes essentiels' },
  { n: 3, label: 'Consolidation', description: 'Appliquer dans des situations variées' },
  { n: 4, label: 'Approfondissement', description: 'Raisonner et justifier' },
  { n: 5, label: 'Expertise', description: 'Niveau lycée et au-delà' },
];

export function getSkillLevel(n: SkillLevelNumber): SkillLevelInfo {
  return SKILL_LEVELS[n - 1];
}
