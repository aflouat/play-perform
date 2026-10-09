import type { Validation } from './inputs';

/** Legal identity of a training centre (personne morale): company, establishment, address. */
export interface CentreIdentity {
  legalName: string;
  /** 9 digits */
  siren: string;
  /** 14 digits: the SIREN followed by the 5-digit establishment number (NIC) */
  siret: string;
  address: string;
  postalCode: string;
  city: string;
}

export type StoredIdentity = { [K in keyof CentreIdentity]: string | null };

const digits = (value: string) => value.replace(/[\s.]/g, '');

/** Luhn checksum, used by INSEE for SIREN and SIRET. */
function luhnValid(number: string): boolean {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let d = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  return sum % 10 === 0;
}

export function validateSiren(input: string): Validation<string> {
  const value = digits(input);
  return /^\d{9}$/.test(value) && luhnValid(value) ? { ok: true, value } : { ok: false, error: 'SIREN invalide : 9 chiffres (ex. 732 829 320).' };
}

/** La Poste's special checksum rule is not handled: its SIRET passes the standard Luhn check anyway. */
export function validateSiret(input: string): Validation<string> {
  const value = digits(input);
  return /^\d{14}$/.test(value) && luhnValid(value) ? { ok: true, value } : { ok: false, error: 'SIRET invalide : 14 chiffres (SIREN + numéro d’établissement).' };
}

export const formatSiren = (siren: string): string => siren.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');
export const formatSiret = (siret: string): string => siret.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1 $2 $3 $4');

export function validateCentreIdentity(input: unknown): Validation<CentreIdentity> {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const raw = input as Record<string, unknown>;
  const text = (key: string, max: number) => (typeof raw[key] === 'string' ? (raw[key] as string).trim().slice(0, max) : '');
  const legalName = text('legalName', 120);
  if (legalName.length < 2) return { ok: false, error: 'Raison sociale obligatoire.' };
  const siren = validateSiren(text('siren', 20));
  if (!siren.ok) return siren;
  const siret = validateSiret(text('siret', 24));
  if (!siret.ok) return siret;
  if (!siret.value.startsWith(siren.value)) return { ok: false, error: 'Le SIRET de l’établissement doit commencer par le SIREN.' };
  const address = text('address', 200);
  if (address.length < 3) return { ok: false, error: 'Adresse de l’établissement obligatoire.' };
  const postalCode = text('postalCode', 5);
  if (!/^\d{5}$/.test(postalCode)) return { ok: false, error: 'Code postal invalide (5 chiffres).' };
  const city = text('city', 80);
  if (city.length < 2) return { ok: false, error: 'Ville obligatoire.' };
  return { ok: true, value: { legalName, siren: siren.value, siret: siret.value, address, postalCode, city } };
}

/** A centre is ready to receive learners once its legal identity is filled in. */
export function isIdentityComplete(identity: StoredIdentity): boolean {
  return Object.values(identity).every((v) => typeof v === 'string' && v.trim() !== '');
}
