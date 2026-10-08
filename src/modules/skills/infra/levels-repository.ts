import { getServerClient } from '@/lib/db/client';
import type { SkillLevelNumber } from '../domain/skill';
import type { SkillLevels } from '../domain/skill-levels';

interface Row { skill_id: string; level: number }

/** Server-side only (service role). */
export async function listLevels(profileId: string): Promise<SkillLevels> {
  const { data, error } = await getServerClient().from('skill_levels').select('skill_id, level').eq('profile_id', profileId);
  if (error) throw new Error(error.message);
  return Object.fromEntries(((data ?? []) as Row[]).map((r) => [r.skill_id, r.level as SkillLevelNumber]));
}

/** Raises the stored level; a lower or equal level never overwrites a higher one. Returns the stored level. */
export async function raiseLevel(profileId: string, skillId: string, level: SkillLevelNumber): Promise<SkillLevelNumber> {
  const db = getServerClient();
  const { data: existing } = await db.from('skill_levels').select('level').eq('profile_id', profileId).eq('skill_id', skillId).maybeSingle();
  const stored = (existing as { level: number } | null)?.level ?? 0;
  if (stored >= level) return stored as SkillLevelNumber;
  const { error } = await db.from('skill_levels').upsert(
    { profile_id: profileId, skill_id: skillId, level, updated_at: new Date().toISOString() }, { onConflict: 'profile_id,skill_id' });
  if (error) throw new Error(error.message);
  return level;
}
