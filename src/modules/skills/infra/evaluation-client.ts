import { getAuthToken } from '@/lib/auth-token';
import type { EvaluationSubmission, SkillEvaluation } from '../domain/evaluation';

const accessToken = getAuthToken;

const headers = (token: string) => ({ 'content-type': 'application/json', authorization: `Bearer ${token}` });

/** Browser side: calls /api/skill-evaluations with the teacher's session. */
export async function fetchProfileEvaluations(profileId: string): Promise<SkillEvaluation[]> {
  const res = await fetch(`/api/skill-evaluations?profileId=${encodeURIComponent(profileId)}`, { headers: headers(await accessToken()) });
  if (!res.ok) return [];
  return ((await res.json()) as { evaluations: SkillEvaluation[] }).evaluations;
}

export async function submitEvaluation(submission: EvaluationSubmission): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch('/api/skill-evaluations', { method: 'POST', headers: headers(await accessToken()), body: JSON.stringify(submission) });
  if (res.ok) return { ok: true };
  const body = (await res.json().catch(() => ({}))) as { error?: string };
  return { ok: false, error: body.error ?? 'Envoi impossible, réessaie plus tard.' };
}

export async function fetchPendingEvaluations(token: string): Promise<(SkillEvaluation & { studentName: string })[]> {
  const res = await fetch('/api/skill-evaluations?status=pending', { headers: headers(token) });
  if (!res.ok) throw new Error(res.status === 403 ? 'Accès réservé aux examinateurs.' : 'Chargement impossible.');
  return ((await res.json()) as { evaluations: (SkillEvaluation & { studentName: string })[] }).evaluations;
}

export async function sendCorrection(token: string, id: string, status: 'passed' | 'failed', comment: string): Promise<string | null> {
  const res = await fetch(`/api/skill-evaluations/${id}`, { method: 'PATCH', headers: headers(token), body: JSON.stringify({ status, comment }) });
  if (res.ok) return null;
  return ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Correction impossible.';
}
