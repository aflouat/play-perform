import type { SkillLevelNumber } from './skill';
import type { Validation } from './evaluation';

export type SkillLevels = Record<string, SkillLevelNumber>;

export interface LevelUpdate { profileId: string; skillId: string; level: SkillLevelNumber }

/** Highest level of each skill across two sources (levels never go down). */
export function mergeLevels(a: SkillLevels, b: SkillLevels): SkillLevels {
  const merged: SkillLevels = { ...a };
  for (const [skillId, level] of Object.entries(b)) {
    if (level > (merged[skillId] ?? 0)) merged[skillId] = level;
  }
  return merged;
}

/** Starting levels from a placement test, for skills that have no level yet. */
export function applyPlacements(levels: SkillLevels, placements: SkillLevels): SkillLevels {
  const result: SkillLevels = { ...levels };
  for (const [skillId, level] of Object.entries(placements)) {
    if (result[skillId] === undefined) result[skillId] = level;
  }
  return result;
}

export function validateLevelUpdate(input: unknown, knownSkill: (id: string) => boolean = () => true): Validation<LevelUpdate> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const { profileId, skillId, level } = input as Record<string, unknown>;
  if (typeof profileId !== 'string' || !profileId) return { ok: false, error: 'Profil manquant.' };
  if (typeof skillId !== 'string' || !knownSkill(skillId)) return { ok: false, error: 'Compétence inconnue.' };
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 5) return { ok: false, error: 'Niveau invalide.' };
  return { ok: true, value: { profileId, skillId, level: level as SkillLevelNumber } };
}
