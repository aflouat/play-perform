import { getAuthToken } from '@/lib/auth-token';
import type { CentreDashboard } from '../domain/centre';
import type { ExaminerDashboard } from '../domain/examiner';

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${await getAuthToken()}` } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch { return null; }
}

export const fetchCentreDashboard = () => get<CentreDashboard>('/api/dashboard/centre');
export const fetchExaminerDashboard = () => get<ExaminerDashboard>('/api/dashboard/examiner');
