import { getAuthToken } from '@/lib/auth-token';
import type { EnrollmentRequest, SkillEnrollment } from '../domain/enrollment';

const headers = async (token?: string) => ({ 'content-type': 'application/json', authorization: `Bearer ${token ?? (await getAuthToken())}` });
const errorOf = async (res: Response, fallback: string) => ((await res.json().catch(() => ({}))) as { error?: string }).error ?? fallback;

/** Browser side: the learner's enrollment requests (empty when unavailable). */
export async function fetchEnrollments(profileId: string): Promise<SkillEnrollment[]> {
  try {
    const res = await fetch(`/api/skill-enrollments?profileId=${encodeURIComponent(profileId)}`, { headers: await headers() });
    return res.ok ? ((await res.json()) as { enrollments: SkillEnrollment[] }).enrollments : [];
  } catch { return []; }
}

export async function submitEnrollment(request: EnrollmentRequest): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch('/api/skill-enrollments', { method: 'POST', headers: await headers(), body: JSON.stringify(request) });
  return res.ok ? { ok: true } : { ok: false, error: await errorOf(res, 'Envoi impossible, réessaie plus tard.') };
}

/** Admin side (training centre). */
export async function fetchPendingEnrollments(token: string): Promise<(SkillEnrollment & { studentName: string })[]> {
  const res = await fetch('/api/skill-enrollments?status=pending', { headers: await headers(token) });
  if (!res.ok) throw new Error(res.status === 403 ? 'Accès réservé au centre de formation.' : 'Chargement impossible.');
  return ((await res.json()) as { enrollments: (SkillEnrollment & { studentName: string })[] }).enrollments;
}

export async function fetchRecentEnrollments(token: string): Promise<(SkillEnrollment & { studentName: string })[]> {
  const res = await fetch('/api/skill-enrollments?status=recent', { headers: await headers(token) });
  return res.ok ? ((await res.json()) as { enrollments: (SkillEnrollment & { studentName: string })[] }).enrollments : [];
}

export async function sendEnrollmentDecision(token: string, id: string, status: 'approved' | 'rejected', comment: string): Promise<string | null> {
  const res = await fetch(`/api/skill-enrollments/${id}`, { method: 'PATCH', headers: await headers(token), body: JSON.stringify({ status, comment }) });
  return res.ok ? null : errorOf(res, 'Décision impossible.');
}
