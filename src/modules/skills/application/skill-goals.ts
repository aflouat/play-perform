/** Target date (YYYY-MM-DD) chosen by the learner to reach mastery of a skill. */
const key = (profileId: string) => `pp:skill-goals:${profileId}`;

function read(profileId: string): Record<string, string> {
  try {
    const raw = localStorage.getItem(key(profileId));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch { return {}; }
}

export function getSkillGoal(profileId: string, skillId: string): string | null {
  return read(profileId)[skillId] ?? null;
}

/** An empty date removes the goal. */
export function setSkillGoal(profileId: string, skillId: string, date: string | null): void {
  const goals = read(profileId);
  if (date) goals[skillId] = date; else delete goals[skillId];
  try { localStorage.setItem(key(profileId), JSON.stringify(goals)); } catch { /* storage unavailable */ }
}
