import { BONUS_XP, bonusStatus, type BonusStatus } from '../domain/bonus';
import { groupOf, pairsFor } from '../domain/pairs';
import { isoWeek, previousWeek } from '../domain/week';

export interface PairData {
  organizationId: string;
  /** Learners of the centre who appear in the community */
  students: { id: string; nickname: string }[];
  /** Weekly challenge results of the current week */
  results: { profile_id: string; week: string; correct: number; total: number }[];
  /** The bonus of this week was already claimed by the viewer */
  claimed: boolean;
}

export interface PairView {
  week: string;
  partners: { nickname: string; played: boolean; mention: boolean }[];
  me: { played: boolean; mention: boolean };
  status: BonusStatus;
  bonusXp: number;
  claimable: boolean;
  claimed: boolean;
}

/** Groups of a centre for a week: seeded by centre and week, avoiding last week's partners. */
export function groupsOfWeek(organizationId: string, week: string, ids: readonly string[]): string[][] {
  return pairsFor(`${organizationId}:${week}`, ids, pairsFor(`${organizationId}:${previousWeek(week)}`, ids));
}

/** What a learner sees of their pair: pseudonyms only, never ids. Null when nobody can be paired with them. */
export function buildPairView(data: PairData, meId: string, now: Date): PairView | null {
  const week = isoWeek(now);
  const group = groupOf(groupsOfWeek(data.organizationId, week, data.students.map((s) => s.id)), meId);
  if (!group) return null;
  const scores = Object.fromEntries(data.results.filter((r) => r.week === week).map((r) => [r.profile_id, { correct: r.correct, total: r.total }]));
  const { status, members } = bonusStatus(group, scores, false); // the bonus is claimed during the week it was earned
  const nick = new Map(data.students.map((s) => [s.id, s.nickname]));
  const mine = members.find((m) => m.id === meId) as { played: boolean; mention: boolean };
  return {
    week, status, bonusXp: BONUS_XP,
    partners: members.filter((m) => m.id !== meId).map((m) => ({ nickname: nick.get(m.id) ?? 'Camarade', played: m.played, mention: m.mention })),
    me: { played: mine.played, mention: mine.mention },
    claimable: status === 'won' && !data.claimed, claimed: status === 'won' && data.claimed,
  };
}
