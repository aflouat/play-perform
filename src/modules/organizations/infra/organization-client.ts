import { getAuthToken } from '@/lib/auth-token';
import type { OrgRole } from '../domain/access';
import type { Member, Organization } from './organization-repository';
import type { CentreIdentity } from '../domain/identity';

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

export async function saveIdentity(organizationId: string, identity: CentreIdentity): Promise<string | null> {
  const res = await fetch(`/api/organizations/${organizationId}`, { method: 'PUT', headers: await headers(), body: JSON.stringify(identity) });
  return res.ok ? null : errorOf(res, 'Enregistrement impossible.');
}

import type { ApplicationInput, CentreApplication } from '../domain/application';

/** Public: files the application of a new centre. Returns an error message or null. */
export async function submitCentreApplication(input: ApplicationInput): Promise<string | null> {
  const res = await fetch('/api/centre-applications', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) });
  return res.ok ? null : errorOf(res, 'Envoi impossible, réessaie plus tard.');
}

export async function fetchMyApplication(): Promise<CentreApplication | null> {
  const res = await fetch('/api/centre-applications/mine', { headers: await headers() });
  return res.ok ? ((await res.json()) as { application: CentreApplication | null }).application : null;
}

export async function fetchPendingApplications(): Promise<CentreApplication[]> {
  const res = await fetch('/api/centre-applications', { headers: await headers() });
  return res.ok ? ((await res.json()) as { applications: CentreApplication[] }).applications : [];
}

export async function decideCentreApplication(id: string, status: 'approved' | 'rejected', comment: string): Promise<string | null> {
  const res = await fetch(`/api/centre-applications/${id}`, { method: 'PATCH', headers: await headers(), body: JSON.stringify({ status, comment }) });
  return res.ok ? null : errorOf(res, 'Décision impossible.');
}
