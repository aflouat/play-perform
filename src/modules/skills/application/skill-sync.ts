import { fetchRemoteLevels, pushRemoteLevel } from '../infra/levels-client';
import { mergeLevels } from '../domain/skill-levels';
import { getAllSkillLevels, setSkillLevel } from './skill-progress';

/**
 * Reconciles this device with the database: each skill keeps the highest level of both sides,
 * levels only present (or higher) locally are sent up. Silent when the database is unreachable.
 */
export async function syncSkillLevels(profileId: string): Promise<void> {
  const remote = await fetchRemoteLevels(profileId);
  if (remote === null) return;
  const local = getAllSkillLevels(profileId);
  const merged = mergeLevels(local, remote);
  for (const [skillId, level] of Object.entries(merged)) {
    if (level !== local[skillId]) setSkillLevel(profileId, skillId, level);
    if (level !== remote[skillId]) await pushRemoteLevel(profileId, skillId, level);
  }
}

/** Fire-and-forget: persist one level change (quiz passed…). The next sync retries if it fails. */
export function persistSkillLevel(profileId: string, skillId: string): void {
  const level = getAllSkillLevels(profileId)[skillId];
  if (level) void pushRemoteLevel(profileId, skillId, level);
}
