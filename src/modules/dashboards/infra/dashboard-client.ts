import { getAuthToken } from '@/lib/auth-token';
import type { CentreDashboard } from '../domain/centre';
import type { ExaminerDashboard } from '../domain/examiner';
import type { TrainingPath } from '../domain/training-path';

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${await getAuthToken()}` } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch { return null; }
}

export const fetchCentreDashboard = () => get<CentreDashboard>('/api/dashboard/centre');
export const fetchExaminerDashboard = () => get<ExaminerDashboard>('/api/dashboard/examiner');

/** The learner's training path: undefined when unavailable (offline, demo profile), null when not chosen yet. */
export async function fetchTrainingPath(profileId: string): Promise<string | null | undefined> {
  const data = await get<{ pathId: string | null }>(`/api/training-path?profileId=${encodeURIComponent(profileId)}`);
  return data ? data.pathId : undefined;
}

/** Saves the path; returns the error to show, or null. */
export async function saveTrainingPath(profileId: string, pathId: string | null): Promise<string | null> {
  try {
    const res = await fetch('/api/training-path', {
      method: 'PUT', headers: { 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` },
      body: JSON.stringify({ profileId, pathId }),
    });
    return res.ok ? null : ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Enregistrement impossible.';
  } catch { return 'Enregistrement impossible.'; }
}

/** The catalogue of training paths (null when unreachable: the built-in paths are used). */
export async function fetchTrainingPathCatalog(): Promise<TrainingPath[] | null> {
  try {
    const res = await fetch('/api/training-paths');
    return res.ok ? ((await res.json()) as { paths: TrainingPath[] }).paths : null;
  } catch { return null; }
}
