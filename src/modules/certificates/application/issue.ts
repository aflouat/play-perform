import { organizationOf, readIdentity } from '@/modules/competition/server';
import { diplomaEligibility, diplomaReference, SKILL_LEVELS } from '@/modules/skills';
import { getSkillById, isEnrolled, listEnrollmentsForProfile, listEvaluationsForProfile, listLevels } from '@/modules/skills/server';
import { learnerSecret } from '@/lib/learner-token';
import { certificateSignature, type CertificateRecord } from '../domain/certificate';
import { insertCertificate, liveCertificate, type StoredCertificate } from '../infra/certificate-repository';

/** Server-side only. Dedicated secret, else the one of the learner sessions. */
export const certificateSecret = (): string => process.env.CERTIFICATE_SECRET || learnerSecret();

/** Public address of the site (QR code, LinkedIn): the configured one, else the request's origin. */
export const siteUrl = (requestOrigin: string): string => process.env.NEXT_PUBLIC_SITE_URL || requestOrigin;

/**
 * Issues the certificate as soon as the learner is eligible to the diploma (everything read from the database), once:
 * returns the live certificate, or null while something is missing.
 */
export async function issueIfEligible(profileId: string, skillId: string): Promise<StoredCertificate | null> {
  const existing = await liveCertificate(profileId, skillId);
  if (existing) return existing;
  const skill = getSkillById(skillId);
  if (!skill) return null;
  const [levels, enrollments, evaluations, identity, organizationId] = await Promise.all([
    listLevels(profileId), listEnrollmentsForProfile(profileId), listEvaluationsForProfile(profileId), readIdentity(profileId), organizationOf(profileId),
  ]);
  const hasNames = Boolean(identity?.firstName?.trim() && identity.lastName?.trim());
  const result = diplomaEligibility({
    level: levels[skillId] ?? null, enrolled: isEnrolled(skillId, enrollments), evaluations: evaluations.filter((e) => e.skillId === skillId), hasNames,
  });
  if (!result.eligible || !result.issuedOn || !identity?.firstName || !identity.lastName) return null;
  const base: CertificateRecord = {
    reference: diplomaReference(profileId, skillId, result.issuedOn), profileId, skillId,
    firstName: identity.firstName.trim(), lastName: identity.lastName.trim(), skillName: skill.name, levelLabel: SKILL_LEVELS[4].label,
    centreName: identity.centreName ?? null, issuedOn: result.issuedOn, revokedAt: null,
  };
  // A clash of short references (very rare) gets a suffix; the signature always covers the final reference
  for (const suffix of ['', '-2', '-3']) {
    const record = { ...base, reference: base.reference + suffix };
    const outcome = await insertCertificate({ ...record, signature: certificateSignature(record, certificateSecret()) }, organizationId);
    if (outcome === 'exists') return liveCertificate(profileId, skillId);
    if (outcome === 'created') return { ...record, signature: certificateSignature(record, certificateSecret()) };
  }
  throw new Error('Référence de certificat indisponible');
}

/** After a validated evaluation or oral: issue in the background, never blocking the examiner's correction. */
export function issueInBackground(profileId: string, skillId: string): Promise<void> {
  return issueIfEligible(profileId, skillId).then(() => undefined, (err) => { console.error('[certificates] issue', err); });
}
