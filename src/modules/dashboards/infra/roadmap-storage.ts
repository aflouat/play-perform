import type { RoadmapProgress } from '../domain/roadmap';

/** Roadmap planning of a profile on this device: start day and completion days of phases. */
const key = (profileId: string) => `pp:roadmap:${profileId}`;
const LAST_SKILL = (profileId: string) => `pp:last-skill:${profileId}`;

/** The roadmap starts the first time it is shown: the target dates count from that day. */
export function loadRoadmapProgress(profileId: string, today: string): RoadmapProgress {
  try {
    const raw = localStorage.getItem(key(profileId));
    if (raw) return JSON.parse(raw) as RoadmapProgress;
    const fresh: RoadmapProgress = { startedAt: today, completedAt: {} };
    localStorage.setItem(key(profileId), JSON.stringify(fresh));
    return fresh;
  } catch { return { startedAt: today, completedAt: {} }; }
}

export function recordCompletions(profileId: string, progress: RoadmapProgress, completions: Record<string, string>): RoadmapProgress {
  const next = { ...progress, completedAt: { ...progress.completedAt, ...completions } };
  try { localStorage.setItem(key(profileId), JSON.stringify(next)); } catch { /* storage unavailable */ }
  return next;
}

/** Skill the learner last opened: "Reprendre" goes back there while it is still to do. */
export function rememberLastSkill(profileId: string, skillId: string): void {
  try { localStorage.setItem(LAST_SKILL(profileId), skillId); } catch { /* storage unavailable */ }
}

export function getLastSkill(profileId: string): string | null {
  try { return localStorage.getItem(LAST_SKILL(profileId)); } catch { return null; }
}
