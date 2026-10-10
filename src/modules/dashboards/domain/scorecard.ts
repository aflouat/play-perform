import type { Badge } from '@/types';
import { XP_PER_LEVEL } from '@/lib/score-storage';
import { rankTraps, type TrapQuestion } from '@/modules/community';

export interface RankProgress { rank: number; xpInRank: number; xpPerRank: number; percent: number }

/** XP belongs to the account: progress towards the next "Rang". */
export function rankProgress(xp: number): RankProgress {
  const xpInRank = xp % XP_PER_LEVEL;
  return { rank: Math.floor(xp / XP_PER_LEVEL) + 1, xpInRank, xpPerRank: XP_PER_LEVEL, percent: Math.round((xpInRank / XP_PER_LEVEL) * 100) };
}

/** The latest unlocked badges, newest first. */
export function latestBadges(badges: readonly Badge[], count = 3): Badge[] {
  return badges
    .filter((b): b is Badge & { unlockedAt: Date } => b.unlockedAt !== null)
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, count);
}

/** Anonymous "classic mistake" alert of the feed: how many learners went wrong on a question, never who. */
export interface TrapAlert { questionId: string; question: string; wrong: number; skillId: string }

export function trapAlerts(
  questions: readonly TrapQuestion[], distributions: Record<string, Record<string, number>>, skillId: string, limit = 2,
): TrapAlert[] {
  return rankTraps(questions, distributions, limit).map(({ question, summary }) => ({
    questionId: question.id,
    question: question.question,
    wrong: summary.sample - (distributions[question.id]?.[question.correctOptionId] ?? 0),
    skillId,
  }));
}
