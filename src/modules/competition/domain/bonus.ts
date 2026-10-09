/** Correct answers (out of 5) that earn the "mention" in the weekly challenge. */
export const MENTION_MIN_CORRECT = 4;
/** XP each member of a pair wins when both get the mention. */
export const BONUS_XP = 50;

export interface ChallengeScore { correct: number; total: number }
export type BonusStatus = 'waiting' | 'won' | 'missed';
export interface BonusMember { id: string; played: boolean; mention: boolean }

/** The contract of the pair: "if you both get the mention, you both win the bonus". */
export function bonusStatus(group: readonly string[], scores: Record<string, ChallengeScore | undefined>, weekOver: boolean): { status: BonusStatus; members: BonusMember[] } {
  const members = group.map((id) => ({ id, played: scores[id] !== undefined, mention: (scores[id]?.correct ?? 0) >= MENTION_MIN_CORRECT }));
  const status: BonusStatus = members.every((m) => m.mention) ? 'won' : weekOver ? 'missed' : 'waiting';
  return { status, members };
}
