import { getServerClient } from '@/lib/db/client';
import type { OrgRole } from '../domain/access';
import type { OrganizationInput } from '../domain/inputs';
import type { CentreIdentity, StoredIdentity } from '../domain/identity';

export interface Organization extends StoredIdentity { id: string; name: string; slug: string; kind: 'parent' | 'center' }

interface OrganizationRow {
  id: string; name: string; slug: string; kind: 'parent' | 'center';
  legal_name: string | null; siren: string | null; siret: string | null; address: string | null; postal_code: string | null; city: string | null;
}

const COLUMNS = 'id, name, slug, kind, legal_name, siren, siret, address, postal_code, city';
const toOrganization = (r: OrganizationRow): Organization => ({
  id: r.id, name: r.name, slug: r.slug, kind: r.kind,
  legalName: r.legal_name, siren: r.siren, siret: r.siret, address: r.address, postalCode: r.postal_code, city: r.city,
});
export interface Member { userId: string; email: string; role: OrgRole }

const db = () => getServerClient();

/** Server-side only (service role). `ids` = "all" lists every organization. */
export async function listOrganizations(ids: 'all' | string[]): Promise<Organization[]> {
  if (ids !== 'all' && ids.length === 0) return [];
  let query = db().from('organizations').select(COLUMNS).order('kind').order('name');
  if (ids !== 'all') query = query.in('id', ids);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as OrganizationRow[]).map(toOrganization);
}

/** Returns null when the slug is already taken. */
export async function createOrganization(input: OrganizationInput): Promise<Organization | null> {
  const { data, error } = await db().from('organizations').insert({ name: input.name, slug: input.slug, kind: 'center' }).select(COLUMNS).single();
  if (error) {
    if (error.code === '23505') return null;
    throw new Error(error.message);
  }
  return toOrganization(data as OrganizationRow);
}

/** Saves the legal identity of a centre. 'taken' when another centre already uses this SIRET. */
export async function updateIdentity(id: string, identity: CentreIdentity): Promise<'ok' | 'taken'> {
  const { error } = await db().from('organizations').update({
    legal_name: identity.legalName, siren: identity.siren, siret: identity.siret, address: identity.address, postal_code: identity.postalCode, city: identity.city,
  }).eq('id', id);
  if (!error) return 'ok';
  if (error.code === '23505') return 'taken';
  throw new Error(error.message);
}

export async function listMembers(organizationId: string): Promise<Member[]> {
  const { data, error } = await db().from('memberships').select('user_id, email, role').eq('organization_id', organizationId).order('email');
  if (error) throw new Error(error.message);
  return ((data ?? []) as { user_id: string; email: string; role: OrgRole }[]).map((m) => ({ userId: m.user_id, email: m.email, role: m.role }));
}

export async function addMember(organizationId: string, userId: string, email: string, role: OrgRole): Promise<void> {
  const { error } = await db().from('memberships').upsert({ organization_id: organizationId, user_id: userId, email, role }, { onConflict: 'user_id,organization_id,role' });
  if (error) throw new Error(error.message);
}

export async function removeMember(organizationId: string, userId: string, role: OrgRole): Promise<void> {
  const { error } = await db().from('memberships').delete().eq('organization_id', organizationId).eq('user_id', userId).eq('role', role);
  if (error) throw new Error(error.message);
}

/** The user for an e-mail address, inviting them (Supabase invitation e-mail) when they have no account yet. */
export async function findOrInviteUser(email: string, redirectTo: string): Promise<{ userId: string; invited: boolean }> {
  const admin = db().auth.admin;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const found = data.users.find((u) => u.email?.toLowerCase() === email);
    if (found) return { userId: found.id, invited: false };
    if (data.users.length < 200) break;
  }
  const { data, error } = await admin.inviteUserByEmail(email, { redirectTo });
  if (error || !data.user) throw new Error(error?.message ?? 'Invitation impossible');
  return { userId: data.user.id, invited: true };
}

export async function organizationOfStudent(profileId: string): Promise<string | null> {
  const { data } = await db().from('students').select('organization_id').eq('id', profileId).maybeSingle();
  return (data as { organization_id: string } | null)?.organization_id ?? null;
}
