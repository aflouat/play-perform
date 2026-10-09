import { getServerClient } from '@/lib/db/client';
import { generateNickname } from '../domain/nickname';
import type { CompetitionData } from '../application/view';

const db = () => getServerClient();

/** Server-side only (service role). */
export async function organizationOf(profileId: string): Promise<string | null> {
  const { data } = await db().from('students').select('organization_id').eq('id', profileId).maybeSingle();
  return (data as { organization_id: string } | null)?.organization_id ?? null;
}

/** Gives the student a generated pseudonym the first time one is needed (retries on a clash inside the centre). */
export async function ensureNickname(profileId: string): Promise<string> {
  const { data } = await db().from('students').select('nickname').eq('id', profileId).maybeSingle();
  const current = (data as { nickname: string | null } | null)?.nickname;
  if (current) return current;
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = generateNickname(attempt === 0 ? profileId : `${profileId}:${attempt}`);
    const { error } = await db().from('students').update({ nickname: candidate }).eq('id', profileId).is('nickname', null);
    if (!error) return candidate;
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Pseudo introuvable');
}

/** Everything the ranking needs for one centre: students that agreed to appear, their scores, levels and challenge results. */
export async function loadCompetitionData(organizationId: string, meId: string): Promise<CompetitionData> {
  await ensureNickname(meId);
  const { data: students, error } = await db().from('students').select('id, nickname').eq('organization_id', organizationId).eq('show_in_ranking', true).not('nickname', 'is', null);
  if (error) throw new Error(error.message);
  const visible = (students ?? []) as { id: string; nickname: string }[];
  const ids = visible.map((s) => s.id);
  if (ids.length === 0) return { students: [], scores: [], levelSums: {}, results: [], revocations: [] };

  const [scores, levels, results, revocations] = await Promise.all([
    db().from('scores').select('profile_id, xp, streak').in('profile_id', ids),
    db().from('skill_levels').select('profile_id, level').in('profile_id', ids),
    db().from('challenge_results').select('profile_id, week, correct, total, duration_ms').eq('organization_id', organizationId),
    db().from('reward_revocations').select('profile_id, week').in('profile_id', ids),
  ]);
  const levelSums: Record<string, number> = {};
  for (const row of (levels.data ?? []) as { profile_id: string; level: number }[]) levelSums[row.profile_id] = (levelSums[row.profile_id] ?? 0) + row.level;
  return {
    students: visible,
    scores: (scores.data ?? []) as CompetitionData['scores'],
    levelSums,
    results: (results.data ?? []) as CompetitionData['results'],
    revocations: (revocations.data ?? []) as CompetitionData['revocations'],
  };
}

export interface ChallengeInsert { profileId: string; organizationId: string; week: string; skillId: string; correct: number; total: number; durationMs: number }

/** Returns false when the student already played this week's challenge. */
export async function saveChallengeResult(r: ChallengeInsert): Promise<boolean> {
  const { error } = await db().from('challenge_results').insert({
    profile_id: r.profileId, organization_id: r.organizationId, week: r.week, skill_id: r.skillId, correct: r.correct, total: r.total, duration_ms: r.durationMs,
  });
  if (!error) return true;
  if (error.code === '23505') return false;
  throw new Error(error.message);
}

export async function updateRankingProfile(profileId: string, patch: { nickname?: string; showInRanking?: boolean }): Promise<'ok' | 'taken'> {
  const update: Record<string, unknown> = {};
  if (patch.nickname !== undefined) update.nickname = patch.nickname;
  if (patch.showInRanking !== undefined) update.show_in_ranking = patch.showInRanking;
  const { error } = await db().from('students').update(update).eq('id', profileId);
  if (!error) return 'ok';
  if (error.code === '23505') return 'taken';
  throw new Error(error.message);
}

export async function revokeAward(profileId: string, week: string): Promise<void> {
  const { error } = await db().from('reward_revocations').upsert({ profile_id: profileId, week }, { onConflict: 'profile_id,week' });
  if (error) throw new Error(error.message);
}

export interface StoredIdentity {
  firstName: string | null; lastName: string | null; nickname: string | null; showInRanking: boolean;
  /** Legal name of the centre the learner belongs to (printed on the diploma) */
  centreName: string | null;
}

export async function readIdentity(profileId: string): Promise<StoredIdentity | null> {
  const { data } = await db().from('students').select('name, last_name, nickname, show_in_ranking, organization_id').eq('id', profileId).maybeSingle();
  if (!data) return null;
  const row = data as { name: string; last_name: string | null; nickname: string | null; show_in_ranking: boolean | null; organization_id: string };
  const { data: centre } = await db().from('organizations').select('name, legal_name').eq('id', row.organization_id).maybeSingle();
  const c = centre as { name: string; legal_name: string | null } | null;
  return { firstName: row.name, lastName: row.last_name, nickname: row.nickname, showInRanking: row.show_in_ranking !== false, centreName: c ? (c.legal_name ?? c.name) : null };
}

/** Saves first name (students.name), last name and pseudonym. 'taken' when the pseudonym is used in the centre. */
export async function writeIdentity(profileId: string, patch: { firstName?: string; lastName?: string; nickname?: string }): Promise<'ok' | 'taken'> {
  const update: Record<string, unknown> = {};
  if (patch.firstName !== undefined) update.name = patch.firstName;
  if (patch.lastName !== undefined) update.last_name = patch.lastName;
  if (patch.nickname !== undefined) update.nickname = patch.nickname;
  const { error } = await db().from('students').update(update).eq('id', profileId);
  if (!error) return 'ok';
  if (error.code === '23505') return 'taken';
  throw new Error(error.message);
}
