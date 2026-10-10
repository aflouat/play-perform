/** Public face of a franchised training centre ("vitrine"): its landing page and the information requests it receives. */

export interface CentreRow {
  id: string; name: string; slug: string; kind: string; legal_name?: string | null; siren?: string | null; siret?: string | null;
  address: string | null; postal_code: string | null; city: string | null;
}

/** What the landing shows: trade name and place only (legal identifiers stay in the back office). */
export interface PublicCentre { id: string; name: string; slug: string; address: string | null; postalCode: string | null; city: string | null }

export const publicCentre = (r: CentreRow): PublicCentre =>
  ({ id: r.id, name: r.name, slug: r.slug, address: r.address, postalCode: r.postal_code, city: r.city });

/** Title and description of the centre's page for search engines: a local page per centre. */
export function centreMetadata(c: PublicCentre): { title: string; description: string } {
  const where = c.city ? ` à ${c.city}` : '';
  return {
    title: `${c.name} — formations et oraux${where} | Play Perform`,
    description: `${c.name}${where} : apprends à ton rythme en ligne, puis valide chaque compétence à l’oral avec un examinateur certifié, jusqu’au diplôme.`,
  };
}

export type LeadStatus = 'new' | 'contacted' | 'enrolled' | 'closed';
export const LEAD_STATUSES: readonly LeadStatus[] = ['new', 'contacted', 'enrolled', 'closed'];
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = { new: 'Nouvelle', contacted: 'Contacté', enrolled: 'Inscrit', closed: 'Sans suite' };

export interface LeadInput { firstName: string; contact: string; pathId: string | null; message: string }
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?\d{10,15}$/;

/** A visitor asks the centre to call them back: first name, e-mail or phone, the path of interest, consent to be contacted. */
export function validateLead(input: unknown, pathIds: readonly string[]): Result<LeadInput> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const raw = input as Record<string, unknown>;
  if (raw.consent !== true) return { ok: false, error: 'Coche la case pour accepter que le centre te recontacte.' };
  const firstName = typeof raw.firstName === 'string' ? raw.firstName.trim() : '';
  if (firstName.length < 2 || firstName.length > 40) return { ok: false, error: 'Indique ton prénom.' };
  const rawContact = typeof raw.contact === 'string' ? raw.contact.trim() : '';
  const phone = rawContact.replace(/[\s.-]/g, '');
  const contact = EMAIL.test(rawContact) ? rawContact.toLowerCase() : PHONE.test(phone) ? phone : null;
  if (!contact) return { ok: false, error: 'Indique un e-mail ou un numéro de téléphone valide.' };
  const message = typeof raw.message === 'string' ? raw.message.trim() : '';
  if (message.length > 1000) return { ok: false, error: 'Ton message dépasse 1 000 caractères.' };
  const pathId = typeof raw.pathId === 'string' && pathIds.includes(raw.pathId) ? raw.pathId : null;
  return { ok: true, value: { firstName, contact, pathId, message } };
}

export function validateLeadStatus(input: unknown): Result<LeadStatus> {
  const status = (input as Record<string, unknown> | null)?.status;
  return LEAD_STATUSES.includes(status as LeadStatus) ? { ok: true, value: status as LeadStatus } : { ok: false, error: 'Statut invalide.' };
}
