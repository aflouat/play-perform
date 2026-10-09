import { validateNickname, validatePersonName } from './nickname';

export interface LearnerIdentity { firstName: string | null; lastName: string | null; nickname: string | null }

export interface IdentityUpdate { profileId: string; firstName?: string; lastName?: string; nickname?: string }
export type IdentityUpdateResult = { ok: true; value: IdentityUpdate } | { ok: false; error: string };

const filled = (value: string | null) => typeof value === 'string' && value.trim() !== '';

/** Pseudonym for the ranking and the community + first and last name for the diploma. */
export const isIdentityReady = (i: LearnerIdentity): boolean => filled(i.firstName) && filled(i.lastName) && filled(i.nickname);

/** The diploma carries the real names only. */
export const canPrintDiploma = (i: LearnerIdentity): boolean => filled(i.firstName) && filled(i.lastName);

/** Body of PUT /api/profile: any subset of the three fields, each validated (the pseudonym against the names of the same request). */
export function validateIdentityUpdate(input: unknown, known: { firstName?: string | null; lastName?: string | null } = {}): IdentityUpdateResult {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.' };
  const raw = input as Record<string, unknown>;
  if (typeof raw.profileId !== 'string' || !raw.profileId) return { ok: false, error: 'Profil manquant.' };
  const value: IdentityUpdate = { profileId: raw.profileId };
  for (const key of ['firstName', 'lastName'] as const) {
    if (raw[key] === undefined) continue;
    const name = validatePersonName(raw[key]);
    if (!name.ok) return name;
    value[key] = name.value;
  }
  if (raw.nickname !== undefined) {
    const nickname = validateNickname(raw.nickname, { firstName: value.firstName ?? known.firstName, lastName: value.lastName ?? known.lastName });
    if (!nickname.ok) return nickname;
    value.nickname = nickname.value;
  }
  if (Object.keys(value).length === 1) return { ok: false, error: 'Rien à enregistrer.' };
  return { ok: true, value };
}
