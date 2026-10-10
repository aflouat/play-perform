/** @jest-environment node */
import {
  certificateSignature, linkedInAddToProfileUrl, linkedInShareUrl, publicHolderName, verificationStatus, verificationUrl, type CertificateRecord,
} from '@/modules/certificates/domain/certificate';

const SECRET = 'test-secret';
const record = (patch: Partial<CertificateRecord> = {}): CertificateRecord => ({
  reference: 'PP-0A1B2C3D', profileId: 'p1', skillId: 'labo-solutions', firstName: 'Léa', lastName: 'Martin',
  skillName: 'Solutions et dilutions', levelLabel: 'Expertise', centreName: 'Centre Alpha', issuedOn: '2026-10-10', revokedAt: null, ...patch,
});

describe('signature', () => {
  it('is stable for a certificate and changes with any printed field', () => {
    const sig = certificateSignature(record(), SECRET);
    expect(sig).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(certificateSignature(record(), SECRET)).toBe(sig);
    expect(certificateSignature(record({ lastName: 'Martine' }), SECRET)).not.toBe(sig);
    expect(certificateSignature(record({ issuedOn: '2026-10-11' }), SECRET)).not.toBe(sig);
    expect(certificateSignature(record(), 'other-secret')).not.toBe(sig);
  });
});

describe('verification', () => {
  const sig = certificateSignature(record(), SECRET);

  it('is valid when the reference exists and the signature of the QR code matches', () => {
    expect(verificationStatus(record(), sig, SECRET)).toBe('valid');
    expect(verificationStatus(record(), null, SECRET)).toBe('valid'); // reference typed by hand: the registry answers
  });

  it('detects an unknown reference, a forged signature and a revoked certificate', () => {
    expect(verificationStatus(null, sig, SECRET)).toBe('unknown');
    expect(verificationStatus(record(), 'AAAAAAAAAAAAAAAAAAAAAA', SECRET)).toBe('forged');
    expect(verificationStatus(record({ revokedAt: '2026-11-01T00:00:00Z' }), sig, SECRET)).toBe('revoked');
  });

  it('builds the URL encoded in the QR code', () => {
    expect(verificationUrl('https://playperform.fr/', 'PP-0A1B2C3D', sig)).toBe(`https://playperform.fr/verifier/PP-0A1B2C3D?s=${sig}`);
  });

  it('shows the holder publicly as first name and initial (learners are often minors)', () => {
    expect(publicHolderName(record())).toBe('Léa M.');
    expect(publicHolderName(record({ lastName: ' ' }))).toBe('Léa');
  });
});

describe('LinkedIn', () => {
  it('adds the certification to the learner’s profile with the verification link', () => {
    const url = new URL(linkedInAddToProfileUrl(record(), 'https://playperform.fr/verifier/PP-0A1B2C3D'));
    expect(url.origin + url.pathname).toBe('https://www.linkedin.com/profile/add');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      startTask: 'CERTIFICATION_NAME', name: 'Solutions et dilutions — niveau Expertise', organizationName: 'Play Perform',
      issueYear: '2026', issueMonth: '10', certUrl: 'https://playperform.fr/verifier/PP-0A1B2C3D', certId: 'PP-0A1B2C3D',
    });
  });

  it('shares the verification page in a post', () => {
    expect(linkedInShareUrl('https://playperform.fr/verifier/PP-0A1B2C3D'))
      .toBe('https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fplayperform.fr%2Fverifier%2FPP-0A1B2C3D');
  });
});

describe('PDF', () => {
  it('renders a one-page A4 landscape certificate carrying its reference, even with characters the font lacks', async () => {
    const { PDFDocument } = await import('pdf-lib');
    const { certificatePdf } = await import('@/modules/certificates/infra/certificate-pdf');
    const bytes = await certificatePdf(record({ firstName: 'Nguyễn', lastName: 'Łukasz 李' }), 'https://playperform.fr/verifier/PP-0A1B2C3D?s=abc');
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(doc.getPage(0).getSize()).toEqual({ width: 842, height: 595 });
    expect(doc.getTitle()).toContain('PP-0A1B2C3D');
    expect(doc.getAuthor()).toBe('Play Perform');
  });
});
