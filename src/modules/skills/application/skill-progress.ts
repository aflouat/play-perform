'use client';

import { useMemo, useSyncExternalStore } from 'react';
import type { SkillLevelNumber } from '../domain/skill';

/**
 * Learning level per skill, stored per profile.
 * XP belongs to the account (see useScore); the level of advancement is
 * tracked here, independently for each skill of the learner's project.
 */
type SkillLevels = Record<string, SkillLevelNumber>;

const key = (profileId: string) => `pp:skill-levels:${profileId}`;
const CHANGE_EVENT = 'pp:skill-levels-change';

function read(profileId: string): SkillLevels {
  try {
    const raw = localStorage.getItem(key(profileId));
    return raw ? (JSON.parse(raw) as SkillLevels) : {};
  } catch {
    return {};
  }
}

function write(profileId: string, levels: SkillLevels): void {
  try {
    localStorage.setItem(key(profileId), JSON.stringify(levels));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch { /* storage unavailable */ }
}

export function getAllSkillLevels(profileId: string): SkillLevels {
  return read(profileId);
}

export function getSkillLevelFor(profileId: string, skillId: string): SkillLevelNumber | null {
  return read(profileId)[skillId] ?? null;
}

export function setSkillLevel(profileId: string, skillId: string, level: SkillLevelNumber): void {
  write(profileId, { ...read(profileId), [skillId]: level });
}

/** Moves a skill up one level (starts at 1, capped at 5) and returns the new level. */
export function advanceSkillLevel(profileId: string, skillId: string): SkillLevelNumber {
  const current = getSkillLevelFor(profileId, skillId);
  const next = (current === null ? 1 : Math.min(5, current + 1)) as SkillLevelNumber;
  setSkillLevel(profileId, skillId, next);
  return next;
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** Levels of a profile by skill id, kept in sync with changes. Empty during SSR / hydration. */
export function useSkillLevels(profileId: string): SkillLevels {
  const raw = useSyncExternalStore(subscribe, () => localStorage.getItem(key(profileId)), () => null);
  return useMemo(() => {
    try { return raw ? (JSON.parse(raw) as SkillLevels) : {}; } catch { return {}; }
  }, [raw]);
}
