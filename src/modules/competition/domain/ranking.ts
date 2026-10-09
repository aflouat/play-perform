export type RankMetric = 'xp' | 'streak' | 'levels';

export interface BoardRow { id: string; nickname: string; xp: number; streak: number; levels: number }
export type RankedRow = BoardRow & { rank: number };

/** Competition ranking: ties share the rank (1, 2, 2, 4). */
export function rankBy(rows: readonly BoardRow[], metric: RankMetric): RankedRow[] {
  const sorted = [...rows].sort((a, b) => b[metric] - a[metric] || a.nickname.localeCompare(b.nickname));
  return sorted.map((row, i) => ({ ...row, rank: i > 0 && sorted[i - 1][metric] === row[metric] ? 0 : i + 1 }))
    .map((row, i, all) => ({ ...row, rank: row.rank === 0 ? all[i - 1].rank : row.rank }));
}

export interface WeeklyResult { profileId: string; nickname: string; correct: number; total: number; durationMs: number }
export type RankedResult = WeeklyResult & { rank: number };

/** Weekly challenge: more correct answers first, then the fastest. */
export function rankWeekly(results: readonly WeeklyResult[]): RankedResult[] {
  return [...results]
    .sort((a, b) => b.correct - a.correct || a.durationMs - b.durationMs)
    .map((r, i) => ({ ...r, rank: i + 1 }));
}

export const MEDALS = ['🥇', '🥈', '🥉'] as const;
export const AWARD_MIN_CORRECT = 3;

export interface Award { profileId: string; nickname: string; medal: (typeof MEDALS)[number] }

/**
 * Medals of a finished week, awarded automatically to the top 3 (3 correct answers at least).
 * A teacher can revoke one: it disappears and nobody takes its place.
 */
export function awardsFor(results: readonly WeeklyResult[], revoked: ReadonlySet<string>): Award[] {
  return rankWeekly(results)
    .slice(0, MEDALS.length)
    .filter((r) => r.correct >= AWARD_MIN_CORRECT && !revoked.has(r.profileId))
    .map((r) => ({ profileId: r.profileId, nickname: r.nickname, medal: MEDALS[r.rank - 1] }));
}
