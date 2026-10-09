import type { Award, BoardRow, RankMetric, RankedResult, RankedRow, WeeklyResult } from '../domain/ranking';
import { awardsFor, rankBy, rankWeekly } from '../domain/ranking';
import { isoWeek, previousWeek } from '../domain/week';

/** Raw rows of one centre, as read from the database (server side). */
export interface CompetitionData {
  students: { id: string; nickname: string }[];
  scores: { profile_id: string; xp: number; streak: number }[];
  levelSums: Record<string, number>;
  results: { profile_id: string; week: string; correct: number; total: number; duration_ms: number }[];
  revocations: { profile_id: string; week: string }[];
}

/** What a student sees: pseudonyms only, no ids. */
export interface CompetitionView {
  week: string;
  board: (Omit<RankedRow, 'id'> & { isMe: boolean })[];
  weekly: (Omit<RankedResult, 'profileId'> & { isMe: boolean })[];
  myResult: { correct: number; total: number } | null;
  pastAwards: { week: string; awards: Omit<Award, 'profileId'>[] }[];
  myTrophies: { week: string; medal: Award['medal'] }[];
}

const PAST_WEEKS = 4;

/** Automatic medals of the last finished weeks (with profile ids: for teachers only, never sent to students). */
export function pastAwardsOf(data: CompetitionData, now: Date): { week: string; awards: Award[] }[] {
  const nicknameOf = new Map(data.students.map((s) => [s.id, s.nickname]));
  const past: { week: string; awards: Award[] }[] = [];
  for (let w = previousWeek(isoWeek(now)), i = 0; i < PAST_WEEKS; w = previousWeek(w), i++) {
    const results: WeeklyResult[] = data.results.filter((r) => r.week === w && nicknameOf.has(r.profile_id)).map((r) => ({
      profileId: r.profile_id, nickname: nicknameOf.get(r.profile_id) as string, correct: r.correct, total: r.total, durationMs: r.duration_ms,
    }));
    const revoked = new Set(data.revocations.filter((r) => r.week === w).map((r) => r.profile_id));
    const awards = awardsFor(results, revoked);
    if (awards.length > 0) past.push({ week: w, awards });
  }
  return past;
}

export function buildCompetitionView(data: CompetitionData, meId: string, metric: RankMetric, now: Date): CompetitionView {
  const week = isoWeek(now);
  const scoreOf = new Map(data.scores.map((s) => [s.profile_id, s]));
  const nicknameOf = new Map(data.students.map((s) => [s.id, s.nickname]));

  const rows: BoardRow[] = data.students.map((s) => ({
    id: s.id, nickname: s.nickname, xp: scoreOf.get(s.id)?.xp ?? 0, streak: scoreOf.get(s.id)?.streak ?? 0, levels: data.levelSums[s.id] ?? 0,
  }));
  const board = rankBy(rows, metric).map((r) => ({ rank: r.rank, nickname: r.nickname, xp: r.xp, streak: r.streak, levels: r.levels, isMe: r.id === meId }));

  const resultsOf = (w: string): WeeklyResult[] => data.results.filter((r) => r.week === w && nicknameOf.has(r.profile_id)).map((r) => ({
    profileId: r.profile_id, nickname: nicknameOf.get(r.profile_id) as string, correct: r.correct, total: r.total, durationMs: r.duration_ms,
  }));
  const weekly = rankWeekly(resultsOf(week)).map((r) => ({ rank: r.rank, nickname: r.nickname, correct: r.correct, total: r.total, durationMs: r.durationMs, isMe: r.profileId === meId }));
  const mine = data.results.find((r) => r.week === week && r.profile_id === meId);

  const past = pastAwardsOf(data, now);
  const pastAwards: CompetitionView['pastAwards'] = past.map((p) => ({ week: p.week, awards: p.awards.map((a) => ({ nickname: a.nickname, medal: a.medal })) }));
  const myTrophies: CompetitionView['myTrophies'] = past.flatMap((p) => {
    const medal = p.awards.find((a) => a.profileId === meId)?.medal;
    return medal ? [{ week: p.week, medal }] : [];
  });
  return { week, board, weekly, myResult: mine ? { correct: mine.correct, total: mine.total } : null, pastAwards, myTrophies };
}
