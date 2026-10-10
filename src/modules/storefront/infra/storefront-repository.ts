import { getServerClient } from '@/lib/db/client';
import { publicCentre, type CentreRow, type LeadInput, type LeadStatus, type PublicCentre } from '../domain/storefront';

/** Server-side only (service role). */
export interface Lead { id: string; organizationId: string; firstName: string; contact: string; pathId: string | null; message: string; status: LeadStatus; createdAt: string }

interface LeadRow { id: string; organization_id: string; first_name: string; contact: string; training_path: string | null; message: string; status: LeadStatus; created_at: string }
const toLead = (r: LeadRow): Lead => ({ id: r.id, organizationId: r.organization_id, firstName: r.first_name, contact: r.contact, pathId: r.training_path, message: r.message, status: r.status, createdAt: r.created_at });
const leads = () => getServerClient().from('centre_leads');

export async function getPublicCentre(slug: string): Promise<PublicCentre | null> {
  const { data, error } = await getServerClient().from('organizations').select('id, name, slug, kind, address, postal_code, city').eq('slug', slug).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? publicCentre(data as CentreRow) : null;
}

/** Free oral slots of the centre in the coming weeks (shown on its page as a sign of activity). */
export async function countOpenSlots(organizationId: string, days = 30): Promise<number> {
  const now = Date.now();
  const { count } = await getServerClient().from('exam_slots').select('id', { count: 'exact', head: true }).eq('organization_id', organizationId)
    .eq('status', 'available').gte('starts_at', new Date(now).toISOString()).lt('starts_at', new Date(now + days * 86_400_000).toISOString());
  return count ?? 0;
}

export async function insertLead(organizationId: string, lead: LeadInput): Promise<void> {
  const { error } = await leads().insert({ organization_id: organizationId, first_name: lead.firstName, contact: lead.contact, training_path: lead.pathId, message: lead.message });
  if (error) throw new Error(error.message);
}

/** Requests of the given centres ("all" for the parent company), newest first. */
export async function listLeads(organizations: 'all' | string[]): Promise<Lead[]> {
  if (organizations !== 'all' && organizations.length === 0) return [];
  let query = leads().select('*').order('created_at', { ascending: false }).limit(200);
  if (organizations !== 'all') query = query.in('organization_id', organizations);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as LeadRow[]).map(toLead);
}

export async function organizationOfLead(id: string): Promise<string | null> {
  const { data } = await leads().select('organization_id').eq('id', id).maybeSingle();
  return (data as { organization_id: string } | null)?.organization_id ?? null;
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<void> {
  const { error } = await leads().update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error(error.message);
}
