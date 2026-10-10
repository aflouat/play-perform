import { getAuthToken } from '@/lib/auth-token';
import type { LeadStatus } from '../domain/storefront';

export interface LeadView { id: string; organizationId: string; firstName: string; contact: string; pathId: string | null; message: string; status: LeadStatus; createdAt: string }

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });

/** Information requests of my centres (null: not allowed or unreachable). */
export async function fetchLeads(): Promise<LeadView[] | null> {
  try {
    const res = await fetch('/api/centre-leads', { headers: await headers() });
    return res.ok ? ((await res.json()) as { leads: LeadView[] }).leads : null;
  } catch { return null; }
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<boolean> {
  try {
    return (await fetch(`/api/centre-leads/${id}`, { method: 'PATCH', headers: await headers(), body: JSON.stringify({ status }) })).ok;
  } catch { return false; }
}
