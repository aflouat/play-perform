import { validateCentreIdentity, type CentreIdentity } from './identity';
import type { Validation } from './inputs';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

/** A new centre asking the parent company to open its space. */
export interface CentreApplication extends CentreIdentity {
  id: string;
  /** E-mail of the account that will manage the centre */
  email: string;
  status: ApplicationStatus;
  comment: string | null;
  createdAt: string;
  decidedAt: string | null;
  organizationId: string | null;
}

export type ApplicationInput = CentreIdentity & { email: string };
export interface ApplicationDecision { status: 'approved' | 'rejected'; comment: string }

export function validateCentreApplication(input: unknown): Validation<ApplicationInput> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const rawEmail = (input as Record<string, unknown>).email;
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 120) return { ok: false, error: 'Adresse e-mail invalide.' };
  const identity = validateCentreIdentity(input);
  return identity.ok ? { ok: true, value: { email, ...identity.value } } : identity;
}

export function validateApplicationDecision(input: unknown): Validation<ApplicationDecision> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const { status, comment } = input as Record<string, unknown>;
  if (status !== 'approved' && status !== 'rejected') return { ok: false, error: 'Décision invalide (approved ou rejected).' };
  const text = typeof comment === 'string' ? comment.trim().slice(0, 1000) : '';
  if (status === 'rejected' && !text) return { ok: false, error: 'Indique la raison du refus.' };
  return { ok: true, value: { status, comment: text } };
}
