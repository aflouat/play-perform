import { getAuthToken } from '@/lib/auth-token';

export interface AuditPerson { id: string; nickname: string | null; name: string }
export interface AuditThread { id: string; project: string; state: 'open' | 'archived'; opensAt: string; closesAt: string; messageCount: number; reportCount: number; members: AuditPerson[] }
export interface AuditTranscript { thread: { id: string; project: string; members: AuditPerson[] }; messages: { id: string; author: Omit<AuditPerson, 'id'>; body: string; createdAt: string; reportedAt: string | null }[] }

async function get<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { authorization: `Bearer ${await getAuthToken()}` } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch { return null; }
}

export const fetchAuditThreads = async (reportedOnly: boolean) => (await get<{ threads: AuditThread[] }>(`/api/audit/chats${reportedOnly ? '?reported=1' : ''}`))?.threads ?? null;
export const fetchAuditTranscript = (id: string) => get<AuditTranscript>(`/api/audit/chats/${id}`);
