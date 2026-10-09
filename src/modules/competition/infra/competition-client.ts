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

/** Teacher: pseudonym and visibility in the ranking of one of their students. Returns an error message or null. */
export async function updateRankingSettings(profileId: string, patch: { nickname?: string; showInRanking?: boolean }): Promise<string | null> {
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
