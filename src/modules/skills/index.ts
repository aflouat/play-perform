/** Public API of the skills module. Other modules must import from here only. */
import { SKILLS_SEED } from './infra/skills-seed';
import type { Skill } from './domain/skill';

export type { Skill, SkillLevelNumber, SkillLevelInfo } from './domain/skill';
export { SKILL_LEVELS, getSkillLevel } from './domain/skill';

export function getSkills(): readonly Skill[] {
  return SKILLS_SEED;
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS_SEED.find((s) => s.id === id);
}
