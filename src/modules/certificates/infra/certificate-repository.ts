import { getServerClient } from '@/lib/db/client';
import type { CertificateRecord } from '../domain/certificate';

/** Server-side only (service role): the registry of certificates. */
interface Row {
  reference: string; profile_id: string; skill_id: string; first_name: string; last_name: string; skill_name: string; level_label: string;
  centre_name: string | null; issued_on: string; signature: string; revoked_at: string | null;
}
export interface StoredCertificate extends CertificateRecord { signature: string }

const table = () => getServerClient().from('certificates');
const toRecord = (r: Row): StoredCertificate => ({
  reference: r.reference, profileId: r.profile_id, skillId: r.skill_id, firstName: r.first_name, lastName: r.last_name, skillName: r.skill_name,
  levelLabel: r.level_label, centreName: r.centre_name, issuedOn: r.issued_on, revokedAt: r.revoked_at, signature: r.signature,
});

export async function findCertificate(reference: string): Promise<StoredCertificate | null> {
  const { data, error } = await table().select('*').eq('reference', reference).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toRecord(data as Row) : null;
}

/** The live (not revoked) certificate of a learner for a skill. */
export async function liveCertificate(profileId: string, skillId: string): Promise<StoredCertificate | null> {
  const { data, error } = await table().select('*').eq('profile_id', profileId).eq('skill_id', skillId).is('revoked_at', null).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toRecord(data as Row) : null;
}

/** 'exists' when the learner already has a live certificate for this skill, 'reference-taken' on a reference clash. */
export async function insertCertificate(c: StoredCertificate, organizationId: string | null): Promise<'created' | 'exists' | 'reference-taken'> {
  const { error } = await table().insert({
    reference: c.reference, profile_id: c.profileId, organization_id: organizationId, skill_id: c.skillId, first_name: c.firstName, last_name: c.lastName,
    skill_name: c.skillName, level_label: c.levelLabel, centre_name: c.centreName, issued_on: c.issuedOn, signature: c.signature,
  });
  if (error?.code === '23505') return error.message.includes('certificates_live_idx') ? 'exists' : 'reference-taken';
  if (error) throw new Error(error.message);
  return 'created';
}

export async function revokeCertificate(reference: string, reason: string): Promise<boolean> {
  const { data, error } = await table().update({ revoked_at: new Date().toISOString(), revoked_reason: reason }).eq('reference', reference).is('revoked_at', null).select('reference');
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
