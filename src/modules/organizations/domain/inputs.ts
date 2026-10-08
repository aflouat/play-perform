import { ORG_ROLES, type OrgRole } from './access';

export type Validation<T> = { ok: true; value: T } | { ok: false; error: string };

export interface OrganizationInput { name: string; slug: string }
export interface MemberInput { email: string; role: OrgRole }

export function slugify(name: string): string {
  return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function validateOrganizationInput(input: unknown): Validation<OrganizationInput> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const { name, slug } = input as Record<string, unknown>;
  const cleanName = typeof name === 'string' ? name.trim() : '';
  if (cleanName.length < 2 || cleanName.length > 80) return { ok: false, error: 'Le nom doit comporter entre 2 et 80 caractères.' };
  const finalSlug = typeof slug === 'string' && slug ? slug : slugify(cleanName);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(finalSlug) || finalSlug.length > 60) return { ok: false, error: 'Identifiant invalide (lettres minuscules, chiffres et tirets).' };
  return { ok: true, value: { name: cleanName, slug: finalSlug } };
}

export function validateMemberInput(input: unknown): Validation<MemberInput> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const { email, role } = input as Record<string, unknown>;
  const clean = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean) || clean.length > 120) return { ok: false, error: 'Adresse e-mail invalide.' };
  if (typeof role !== 'string' || !ORG_ROLES.includes(role as OrgRole)) return { ok: false, error: 'Rôle invalide.' };
  return { ok: true, value: { email: clean, role: role as OrgRole } };
}
