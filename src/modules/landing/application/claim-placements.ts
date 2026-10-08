import { applyPlacements, getAllSkillLevels, setSkillLevel, type SkillLevels } from '@/modules/skills';
import { readSavedPlacements } from '../infra/placement-storage';

const CLAIMED_KEY = 'pp:placements-claimed';

function claimedBy(): string | null {
  try { return localStorage.getItem(CLAIMED_KEY); } catch { return null; }
}

/**
 * Turns the placement tests taken as a visitor into starting skill levels of a profile.
 * The results belong to a single profile (the first one that claims them) and never override a level already earned.
 */
export function claimVisitorPlacements(profileId: string): void {
  const owner = claimedBy();
  if (owner !== null && owner !== profileId) return;
  const saved = readSavedPlacements();
  const placements: SkillLevels = Object.fromEntries(Object.entries(saved).map(([skillId, p]) => [skillId, p.startLevel]));
  if (Object.keys(placements).length === 0) return;

  const current = getAllSkillLevels(profileId);
  const next = applyPlacements(current, placements);
  for (const [skillId, level] of Object.entries(next)) {
    if (current[skillId] !== level) setSkillLevel(profileId, skillId, level);
  }
  try { localStorage.setItem(CLAIMED_KEY, profileId); } catch { /* storage unavailable */ }
}
