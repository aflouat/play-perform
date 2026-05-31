'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Score, XpGain } from '@/types';
import { syncScoreToDb, syncBadgeToDb } from '@/lib/db';
import { XP_PER_LEVEL, calcLevel, initScore, loadFromStorage, saveToStorage } from '@/lib/score-storage';
import { unlockBadge } from '@/lib/score-badges';

interface UseScoreReturn {
  score: Score;
  gains: XpGain[];
  xpToNextLevel: number;
  addXp: (amount: number, reason: XpGain['reason']) => void;
}

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
