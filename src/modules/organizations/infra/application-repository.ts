import { getServerClient } from '@/lib/db/client';
import { slugify } from '../domain/inputs';
import type { ApplicationDecision, ApplicationInput, ApplicationStatus, CentreApplication } from '../domain/application';
import { addMember } from './organization-repository';

interface Row {
  id: string; email: string; legal_name: string; siren: string; siret: string; address: string; postal_code: string; city: string;
  status: ApplicationStatus; comment: string | null; organization_id: string | null; created_at: string; decided_at: string | null;
}

const toApplication = (r: Row): CentreApplication => ({
  id: r.id, email: r.email, legalName: r.legal_name, siren: r.siren, siret: r.siret, address: r.address, postalCode: r.postal_code, city: r.city,
  status: r.status, comment: r.comment, organizationId: r.organization_id, createdAt: r.created_at, decidedAt: r.decided_at,
});

const table = () => getServerClient().from('centre_applications');

export type SubmitResult = { ok: true } | { ok: false; reason: 'siret-taken' };

/** Server-side only (service role). A new submission from the same e-mail replaces its pending one. */
export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const { data: existingCentre } = await getServerClient().from('organizations').select('id').eq('siret', input.siret).maybeSingle();
  if (existingCentre) return { ok: false, reason: 'siret-taken' };
  await table().delete().eq('status', 'pending').ilike('email', input.email);
  const { error } = await table().insert({
    email: input.email, legal_name: input.legalName, siren: input.siren, siret: input.siret, address: input.address, postal_code: input.postalCode, city: input.city,
  });
  if (!error) return { ok: true };
  if (error.code === '23505') return { ok: false, reason: 'siret-taken' };
  throw new Error(error.message);
}

export async function listPendingApplications(): Promise<CentreApplication[]> {
  const { data, error } = await table().select('*').eq('status', 'pending').order('created_at');
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toApplication);
}

/** The latest application of an account, for the banner of its space. */
export async function latestApplicationOf(email: string): Promise<CentreApplication | null> {
  const { data } = await table().select('*').ilike('email', email).order('created_at', { ascending: false }).limit(1).maybeSingle();
  return data ? toApplication(data as Row) : null;
}

export type DecideResult = { ok: true; application: CentreApplication } | { ok: false; reason: 'not-found' | 'no-account' };

/** Approving opens the centre: organization with its legal identity, and the applicant becomes its manager. */
export async function decideApplication(id: string, decision: ApplicationDecision): Promise<DecideResult> {
  const { data } = await table().select('*').eq('id', id).eq('status', 'pending').maybeSingle();
  if (!data) return { ok: false, reason: 'not-found' };
  const application = toApplication(data as Row);
  let organizationId: string | null = null;

  if (decision.status === 'approved') {
    const { userId } = await findAccount(application.email).catch(() => ({ userId: null }));
    if (!userId) return { ok: false, reason: 'no-account' };
    organizationId = await createCentre(application);
    await addMember(organizationId, userId, application.email, 'org_admin');
  }
  const { data: updated, error } = await table()
    .update({ status: decision.status, comment: decision.comment || null, organization_id: organizationId, decided_at: new Date().toISOString() })
    .eq('id', id).select('*').single();
  if (error) throw new Error(error.message);
  return { ok: true, application: toApplication(updated as Row) };
}

async function findAccount(email: string): Promise<{ userId: string | null }> {
  const admin = getServerClient().auth.admin;
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (found) return { userId: found.id };
    if (data.users.length < 200) break;
  }
  return { userId: null };
}

async function createCentre(app: CentreApplication): Promise<string> {
  const base = slugify(app.legalName) || 'centre';
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${app.siret.slice(-4)}${attempt > 1 ? attempt : ''}`;
    const { data, error } = await getServerClient().from('organizations').insert({
      name: app.legalName, slug, kind: 'center', legal_name: app.legalName, siren: app.siren, siret: app.siret,
      address: app.address, postal_code: app.postalCode, city: app.city,
    }).select('id').single();
    if (!error) return (data as { id: string }).id;
    if (error.code !== '23505') throw new Error(error.message);
  }
  throw new Error('Identifiant de centre introuvable');
}

