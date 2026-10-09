'use client';

import { useMemo, useSyncExternalStore } from 'react';
import type { PlacementResult } from '@/modules/quizzes';

/** Placement results of a visitor without account, kept on this device only. */
export interface SavedPlacement {
  startLevel: PlacementResult['startLevel'];
  correct: number;
  total: number;
  testedAt: string;
  /** Option picked for each question (null = "Je ne sais pas"), to review the answers later */
  answers?: (number | null)[];
}

const KEY = 'pp:placements';
const CHANGE_EVENT = 'pp:placements-change';

function readRaw(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

function parse(raw: string | null): Record<string, SavedPlacement> {
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, SavedPlacement>; } catch { return {}; }
}

/** Saved results by skill id (non-reactive read). */
export function readSavedPlacements(): Record<string, SavedPlacement> {
  return parse(readRaw());
}

export function savePlacement(skillId: string, result: PlacementResult, answers?: (number | null)[]): void {
  const all = parse(readRaw());
  all[skillId] = { startLevel: result.startLevel, correct: result.correct, total: result.total, testedAt: new Date().toISOString(), ...(answers ? { answers } : {}) };
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch { /* storage unavailable (private mode): the result is still shown */ }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Saved results by skill id. Empty during SSR / hydration. */
export function useSavedPlacements(): Record<string, SavedPlacement> {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => parse(raw), [raw]);
}
