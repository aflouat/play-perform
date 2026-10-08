import type { Score } from '@/types';

export const XP_PER_LEVEL = 100;

const STORAGE_KEY = (userId: string) => `score:${userId}`;

export function calcLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function initScore(userId: string): Score {
  return {
    userId,
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,
    lastActivityAt: null,
  };
}

export function loadFromStorage(userId: string): Score | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Score;
    parsed.lastActivityAt = parsed.lastActivityAt ? new Date(parsed.lastActivityAt) : null;
    parsed.badges = parsed.badges.map((b) => ({
      ...b,
      unlockedAt: b.unlockedAt ? new Date(b.unlockedAt) : null,
    }));
    return parsed;
  } catch {
    return null;
  }
}

export function saveToStorage(score: Score): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY(score.userId), JSON.stringify(score));
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const DAY_MS = 24 * 60 * 60 * 1000;

/** Consecutive-days streak after an activity at `now`, given the previous streak and last activity. */
export function computeStreak(streak: number, lastActivityAt: Date | null, now: Date): number {
  if (!lastActivityAt) return 1;
  const gapDays = Math.round((startOfDay(now) - startOfDay(lastActivityAt)) / DAY_MS);
  if (gapDays <= 0) return Math.max(streak, 1);
  return gapDays === 1 ? streak + 1 : 1;
}
