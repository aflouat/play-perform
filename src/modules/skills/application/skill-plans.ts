import { EMPTY_PLAN, type StudyPlan } from '../domain/effort';

/** Study plans (goal date, daily minutes, reminder time) of a profile, by skill id. */
const key = (profileId: string) => `pp:skill-plans:${profileId}`;
const LEGACY_GOALS = (profileId: string) => `pp:skill-goals:${profileId}`;

function readAll(profileId: string): Record<string, StudyPlan> {
  try {
    const raw = localStorage.getItem(key(profileId));
    return raw ? (JSON.parse(raw) as Record<string, StudyPlan>) : {};
  } catch { return {}; }
}

/** Goal dates saved before daily efforts existed. */
function legacyGoal(profileId: string, skillId: string): string | null {
  try {
    const raw = localStorage.getItem(LEGACY_GOALS(profileId));
    return raw ? ((JSON.parse(raw) as Record<string, string>)[skillId] ?? null) : null;
  } catch { return null; }
}

export function getAllPlans(profileId: string): Record<string, StudyPlan> {
  return readAll(profileId);
}

export function getSkillPlan(profileId: string, skillId: string): StudyPlan {
  return readAll(profileId)[skillId] ?? { ...EMPTY_PLAN, goalDate: legacyGoal(profileId, skillId) };
}

export function setSkillPlan(profileId: string, skillId: string, plan: StudyPlan): void {
  try { localStorage.setItem(key(profileId), JSON.stringify({ ...readAll(profileId), [skillId]: plan })); } catch { /* storage unavailable */ }
}
