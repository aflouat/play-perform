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
