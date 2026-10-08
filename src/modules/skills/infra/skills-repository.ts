import { SKILLS_SEED } from './skills-seed';
import type { Skill } from '../domain/skill';

export function getSkills(): readonly Skill[] {
  return SKILLS_SEED;
}

export function getSkillById(id: string): Skill | undefined {
  return SKILLS_SEED.find((s) => s.id === id);
}
