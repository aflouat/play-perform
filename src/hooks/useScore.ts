'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Score, Badge, XpGain, BadgeId } from '@/types';
import { syncScoreToDb, syncBadgeToDb } from '@/lib/db';

const XP_PER_LEVEL = 100;
const STORAGE_KEY = (userId: string) => `score:${userId}`;

const ALL_BADGES: Badge[] = [
  { id: 'first-quiz', name: 'Premier Quiz', emoji: '🎯', description: 'Tu as complété ton premier quiz !', unlockedAt: null },
  { id: 'streak-3', name: '3 jours de suite', emoji: '🔥', description: '3 jours d\'affilée sur la plateforme', unlockedAt: null },
  { id: 'streak-7', name: 'Une semaine !', emoji: '⚡', description: '7 jours consécutifs de travail', unlockedAt: null },
  { id: 'perfect-quiz', name: 'Quiz parfait', emoji: '⭐', description: 'Score parfait sur un quiz', unlockedAt: null },
  { id: 'fast-learner', name: 'Rapide !', emoji: '💨', description: 'Quiz complété en moins de 2 minutes', unlockedAt: null },
  { id: 'knowledge-seeker', name: 'Chercheur·euse', emoji: '🔍', description: '500 XP gagnés au total', unlockedAt: null },
];

function calcLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function initScore(userId: string): Score {
  return {
    userId,
    xp: 0,
    level: 1,
    badges: [],
    streak: 0,
    lastActivityAt: null,
  };
}

function loadFromStorage(userId: string): Score | null {
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

function saveToStorage(score: Score): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY(score.userId), JSON.stringify(score));
}

function unlockBadge(badges: Badge[], id: BadgeId): Badge[] {
  if (badges.some((b) => b.id === id && b.unlockedAt)) return badges;
  const template = ALL_BADGES.find((b) => b.id === id);
  if (!template) return badges;
  const existing = badges.find((b) => b.id === id);
  if (existing) {
    return badges.map((b) => (b.id === id ? { ...b, unlockedAt: new Date() } : b));
  }
  return [...badges, { ...template, unlockedAt: new Date() }];
}

interface UseScoreReturn {
  score: Score;
  gains: XpGain[];
  xpToNextLevel: number;
  addXp: (amount: number, reason: XpGain['reason']) => void;
}

/**
 * Gestion du score XP, niveaux et badges.
 * Persiste dans localStorage.
 */
export function useScore(userId: string): UseScoreReturn {
  const [score, setScore] = useState<Score>(() => loadFromStorage(userId) ?? initScore(userId));
  const [gains, setGains] = useState<XpGain[]>([]);

  useEffect(() => {
    saveToStorage(score);
  }, [score]);

  const addXp = useCallback((amount: number, reason: XpGain['reason']) => {
    if (amount <= 0) return;

    setGains((prev) => [
      ...prev,
      { amount, reason, timestamp: new Date() },
    ]);

    setScore((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = calcLevel(newXp);
      let newBadges = [...prev.badges];

      // First ever XP gain
      if (prev.xp === 0) {
        newBadges = unlockBadge(newBadges, 'first-quiz');
      }
      if (reason === 'quiz-perfect') {
        newBadges = unlockBadge(newBadges, 'perfect-quiz');
      }
      if (newXp >= 500) {
        newBadges = unlockBadge(newBadges, 'knowledge-seeker');
      }

      const updated: Score = {
        ...prev,
        xp: newXp,
        level: newLevel,
        badges: newBadges,
        lastActivityAt: new Date(),
      };
      saveToStorage(updated);

      // Background sync to Supabase (fire-and-forget, non-bloquant)
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        syncScoreToDb(userId, newXp, newLevel, updated.streak).catch(() => {});
        newBadges
          .filter((b) => b.unlockedAt && !prev.badges.some((pb) => pb.id === b.id && pb.unlockedAt))
          .forEach((b) => syncBadgeToDb(userId, b.id).catch(() => {}));
      }

      return updated;
    });
  }, [userId]);

  const xpInCurrentLevel = score.xp % XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpInCurrentLevel;

  return { score, gains, xpToNextLevel, addXp };
}
