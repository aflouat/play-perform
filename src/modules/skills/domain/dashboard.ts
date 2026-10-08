import type { QuestionProgress } from '@/types';
import type { SkillLevelNumber } from './skill';

/** Share of the path to mastery (level 5) already walked. */
export function masteryPercent(level: SkillLevelNumber | null): number {
  return (level ?? 0) * 20;
}

export interface Building { emoji: string; label: string }

const BUILDINGS: readonly Building[] = [
  { emoji: '🌱', label: 'Terrain à découvrir' },
  { emoji: '⛺', label: 'Campement' },
  { emoji: '🛖', label: 'Cabane' },
  { emoji: '🏠', label: 'Maison' },
  { emoji: '🏛️', label: 'Grand bâtiment' },
  { emoji: '🏰', label: 'Château' },
];

/** The skill's building on the map: the higher the level, the bigger the construction. */
export function buildingFor(level: SkillLevelNumber | null): Building {
  return BUILDINGS[level ?? 0];
}

export interface ReviewSummary {
  /** Questions seen at least once */
  studied: number;
  lastStudiedAt: string | null;
  /** Reviews that can be done right now */
  dueNow: number;
  nextReviewAt: string | null;
  /** Future reviews grouped by day (YYYY-MM-DD) */
  upcoming: { day: string; count: number }[];
}

/** Past and upcoming reviews of a skill, from the spaced-repetition progress of its questions. */
export function summarizeReviews(progress: Record<string, QuestionProgress>, now: Date): ReviewSummary {
  const seen = Object.values(progress).filter((p) => p.lastSeen !== null);
  const lastStudiedAt = seen.map((p) => p.lastSeen as string).sort().at(-1) ?? null;
  const future = new Map<string, number>();
  let dueNow = 0;
  let nextReviewAt: string | null = null;
  for (const p of seen) {
    if (!p.nextReview) continue;
    if (new Date(p.nextReview) <= now) { dueNow += 1; continue; }
    if (nextReviewAt === null || p.nextReview < nextReviewAt) nextReviewAt = p.nextReview;
    const day = p.nextReview.slice(0, 10);
    future.set(day, (future.get(day) ?? 0) + 1);
  }
  const upcoming = [...future.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, count]) => ({ day, count }));
  return { studied: seen.length, lastStudiedAt, dueNow, nextReviewAt, upcoming };
}

export interface Pace {
  status: 'no-goal' | 'achieved' | 'on-track' | 'late';
  levelsLeft: number;
  daysLeft: number | null;
  /** Days available for each remaining level */
  daysPerLevel: number | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Can the learner reach level 5 by the target date? On track when at least one day per remaining level is left. */
export function paceToGoal(level: SkillLevelNumber | null, goalDate: string | null, now: Date): Pace {
  const levelsLeft = 5 - (level ?? 0);
  if (levelsLeft === 0) return { status: 'achieved', levelsLeft, daysLeft: null, daysPerLevel: null };
  if (!goalDate) return { status: 'no-goal', levelsLeft, daysLeft: null, daysPerLevel: null };
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const [y, m, d] = goalDate.split('-').map(Number);
  const daysLeft = Math.round((new Date(y, m - 1, d).getTime() - today) / DAY_MS);
  const daysPerLevel = daysLeft > 0 ? Math.floor(daysLeft / levelsLeft) : 0;
  return { status: daysPerLevel >= 1 ? 'on-track' : 'late', levelsLeft, daysLeft, daysPerLevel };
}
