import { getAuthToken } from '@/lib/auth-token';
import type { OrgRole } from '@/modules/organizations';

export interface ExaminerStatus { centres: { id: string; name: string }[]; openSlots: number; waiting: number }
export interface StaffMember { userId: string; email: string; roles: OrgRole[]; canOral: boolean; openSlots: number }
export interface WaitingRequest { id: string; profileId: string; studentName: string; organizationId: string; skillId: string; level: number; createdAt: string }
export interface MyOralRequest { id: string; skillId: string; level: number; status: 'waiting' | 'booked' | 'cancelled'; createdAt: string }

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });
async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: await headers() });
    return res.ok ? ((await res.json()) as T) : null;
  } catch { return null; }
}
async function send(url: string, method: string, body?: unknown): Promise<string | null> {
  try {
    const res = await fetch(url, { method, headers: await headers(), body: body === undefined ? undefined : JSON.stringify(body) });
    return res.ok ? null : ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Action impossible.';
  } catch { return 'Action impossible.'; }
}

// Someone allowed to give orals
export const fetchExaminerStatus = () => get<ExaminerStatus>('/api/oral-examiner/status');
// Centre manager
export const fetchOralStaff = async (organizationId: string) => (await get<{ staff: StaffMember[] }>(`/api/oral-staff?organizationId=${encodeURIComponent(organizationId)}`))?.staff ?? null;
export const setOralGrant = (organizationId: string, userId: string, enabled: boolean) => send('/api/oral-staff', 'PUT', { organizationId, userId, enabled });
export const fetchWaitingRequests = async () => (await get<{ requests: WaitingRequest[] }>('/api/oral-requests/centre'))?.requests ?? null;
export const dropWaitingRequest = (id: string) => send(`/api/oral-requests/${id}`, 'DELETE');
// Learner
export const fetchMyOralRequests = async (profileId: string) => (await get<{ requests: MyOralRequest[] }>(`/api/oral-requests?profileId=${encodeURIComponent(profileId)}`))?.requests ?? [];
export const joinOralWaitingList = (profileId: string, skillId: string) => send('/api/oral-requests', 'POST', { profileId, skillId });
