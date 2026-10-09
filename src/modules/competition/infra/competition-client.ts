import { getAuthToken } from '@/lib/auth-token';
import type { CompetitionView } from '../application/view';
import type { RankMetric } from '../domain/ranking';
import type { ChallengeAnswer } from '../application/challenge';

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });
const errorOf = async (res: Response, fallback: string) => ((await res.json().catch(() => ({}))) as { error?: string }).error ?? fallback;

export async function fetchCompetition(profileId: string, metric: RankMetric): Promise<CompetitionView | null> {
  try {
    const res = await fetch(`/api/competition?profileId=${encodeURIComponent(profileId)}&metric=${metric}`, { headers: await headers() });
    return res.ok ? ((await res.json()) as CompetitionView) : null;
  } catch { return null; }
}

export async function submitChallenge(profileId: string, answers: ChallengeAnswer[], durationMs: number): Promise<{ correct: number; total: number } | { error: string }> {
  const res = await fetch('/api/competition/challenge', { method: 'POST', headers: await headers(), body: JSON.stringify({ profileId, answers, durationMs }) });
  return res.ok ? ((await res.json()) as { correct: number; total: number }) : { error: await errorOf(res, 'Envoi impossible, réessaie plus tard.') };
}

/** Teacher: show or hide one of their students in the ranking. Returns an error message or null. */
export async function updateRankingSettings(profileId: string, patch: { showInRanking: boolean }): Promise<string | null> {
  const res = await fetch('/api/competition/profile', { method: 'PUT', headers: await headers(), body: JSON.stringify({ profileId, ...patch }) });
  return res.ok ? null : errorOf(res, 'Enregistrement impossible.');
}

export interface TeacherAward { week: string; profileId: string; nickname: string; medal: string }

export async function fetchTeacherAwards(): Promise<TeacherAward[]> {
  const res = await fetch('/api/competition/awards', { headers: await headers() });
  return res.ok ? ((await res.json()) as { awards: TeacherAward[] }).awards : [];
}

export async function revokeAwardRequest(profileId: string, week: string): Promise<string | null> {
  const res = await fetch('/api/competition/awards', { method: 'DELETE', headers: await headers(), body: JSON.stringify({ profileId, week }) });
  return res.ok ? null : errorOf(res, 'Retrait impossible.');
}

export interface ProfileIdentity {
  firstName: string | null; lastName: string | null; nickname: string | null; showInRanking: boolean; centreName: string | null;
}

export async function fetchIdentity(profileId: string): Promise<ProfileIdentity | null> {
  try {
    const res = await fetch(`/api/profile?profileId=${encodeURIComponent(profileId)}`, { headers: await headers() });
    return res.ok ? ((await res.json()) as ProfileIdentity) : null;
  } catch { return null; }
}

/** The learner (or their teacher) completes first name, last name and/or pseudonym. Returns an error message or null. */
export async function saveIdentity(profileId: string, patch: { firstName?: string; lastName?: string; nickname?: string }): Promise<string | null> {
  const res = await fetch('/api/profile', { method: 'PUT', headers: await headers(), body: JSON.stringify({ profileId, ...patch }) });
  return res.ok ? null : errorOf(res, 'Enregistrement impossible.');
}
