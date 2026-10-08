import { getAuthToken } from '@/lib/auth-token';
import type { OrgRole } from '../domain/access';
import type { Member, Organization } from './organization-repository';

export type { Member, Organization };
export interface MyAccess {
  email: string; isSuperAdmin: boolean;
  memberships: { organizationId: string; organizationName: string; role: OrgRole }[];
}

const headers = async () => ({ 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` });
const errorOf = async (res: Response, fallback: string) => ((await res.json().catch(() => ({}))) as { error?: string }).error ?? fallback;

export async function fetchMyAccess(): Promise<MyAccess | null> {
  const res = await fetch('/api/me', { headers: await headers() });
  return res.ok ? ((await res.json()) as MyAccess) : null;
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const res = await fetch('/api/organizations', { headers: await headers() });
  return res.ok ? ((await res.json()) as { organizations: Organization[] }).organizations : [];
}

export async function createCenter(name: string): Promise<string | null> {
  const res = await fetch('/api/organizations', { method: 'POST', headers: await headers(), body: JSON.stringify({ name }) });
  return res.ok ? null : errorOf(res, 'Création impossible.');
}

export async function fetchMembers(organizationId: string): Promise<Member[]> {
  const res = await fetch(`/api/organizations/${organizationId}/members`, { headers: await headers() });
  return res.ok ? ((await res.json()) as { members: Member[] }).members : [];
}

export async function recruit(organizationId: string, email: string, role: OrgRole): Promise<{ error: string | null; invited: boolean }> {
  const res = await fetch(`/api/organizations/${organizationId}/members`, { method: 'POST', headers: await headers(), body: JSON.stringify({ email, role }) });
  if (!res.ok) return { error: await errorOf(res, 'Recrutement impossible.'), invited: false };
  return { error: null, invited: ((await res.json()) as { invited: boolean }).invited };
}

export async function dismiss(organizationId: string, userId: string, role: OrgRole): Promise<string | null> {
  const res = await fetch(`/api/organizations/${organizationId}/members?userId=${userId}&role=${role}`, { method: 'DELETE', headers: await headers() });
  return res.ok ? null : errorOf(res, 'Retrait impossible.');
}
