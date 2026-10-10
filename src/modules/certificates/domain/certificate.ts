import { createHmac, timingSafeEqual } from 'node:crypto';

/** A certificate of the registry: what is printed on it, and whether Play Perform revoked it. */
export interface CertificateRecord {
  reference: string; profileId: string; skillId: string;
  firstName: string; lastName: string; skillName: string; levelLabel: string; centreName: string | null;
  issuedOn: string; revokedAt: string | null;
}

export type VerificationStatus = 'valid' | 'unknown' | 'forged' | 'revoked';

/** Every printed field, in a fixed order: changing any of them breaks the signature. */
const signedText = (c: CertificateRecord) =>
  ['v1', c.reference, c.profileId, c.skillId, c.firstName, c.lastName, c.skillName, c.levelLabel, c.centreName ?? '', c.issuedOn].join('|');

/** HMAC-SHA256 of the certificate, shortened to 128 bits (22 base64url characters) to fit in the QR code. */
export function certificateSignature(c: CertificateRecord, secret: string): string {
  return createHmac('sha256', secret).update(signedText(c)).digest('base64url').slice(0, 22);
}

/** The registry decides; the signature of the QR code, when present, must match (a reference typed by hand has none). */
export function verificationStatus(c: CertificateRecord | null, signature: string | null, secret: string): VerificationStatus {
  if (!c) return 'unknown';
  if (signature !== null) {
    const expected = Buffer.from(certificateSignature(c, secret));
    const given = Buffer.from(signature);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return 'forged';
  }
  return c.revokedAt ? 'revoked' : 'valid';
}

export const verificationUrl = (siteUrl: string, reference: string, signature: string) =>
  `${siteUrl.replace(/\/+$/, '')}/verifier/${encodeURIComponent(reference)}?s=${signature}`;

/** Name shown on the public verification page: first name and initial (learners are often minors). */
export function publicHolderName(c: Pick<CertificateRecord, 'firstName' | 'lastName'>): string {
  const initial = c.lastName.trim().charAt(0).toUpperCase();
  return initial ? `${c.firstName.trim()} ${initial}.` : c.firstName.trim();
}

export const certificateTitle = (c: Pick<CertificateRecord, 'skillName' | 'levelLabel'>) => `${c.skillName} — niveau ${c.levelLabel}`;

/** LinkedIn "Add to profile" (Licences et certifications), pre-filled. */
export function linkedInAddToProfileUrl(c: CertificateRecord, certUrl: string): string {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME', name: certificateTitle(c), organizationName: 'Play Perform',
    issueYear: c.issuedOn.slice(0, 4), issueMonth: String(Number(c.issuedOn.slice(5, 7))), certUrl, certId: c.reference,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

/** LinkedIn post sharing the public verification page (its preview comes from the page's Open Graph tags). */
export const linkedInShareUrl = (pageUrl: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
