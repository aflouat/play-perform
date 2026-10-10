/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET as mine } from '@/app/api/certificates/route';
import { GET as pdf } from '@/app/api/certificates/[reference]/pdf/route';
import { DELETE as revoke } from '@/app/api/certificates/[reference]/route';
import * as actorAuth from '@/lib/actor-auth';
import * as adminAuth from '@/lib/admin-auth';
import * as server from '@/modules/certificates/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/lib/admin-auth');
jest.mock('@/modules/certificates/server', () => ({
  ...jest.requireActual('@/modules/certificates/domain/certificate'),
  issueIfEligible: jest.fn(), findCertificate: jest.fn(), revokeCertificate: jest.fn(),
  certificatePdf: jest.fn(async () => new Uint8Array([37, 80, 68, 70])), siteUrl: () => 'https://playperform.fr',
}));

const repo = jest.mocked(server);
const cert = { reference: 'PP-0A1B2C3D', profileId: 'p1', skillId: 'logique', firstName: 'Léa', lastName: 'Martin', skillName: 'Logique', levelLabel: 'Expertise', centreName: null, issuedOn: '2026-10-09', revokedAt: null as string | null, signature: 'sig' };
const params = { params: Promise.resolve({ reference: 'PP-0A1B2C3D' }) };

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  jest.mocked(actorAuth.canAccessProfile).mockResolvedValue(true);
  repo.certificatePdf.mockResolvedValue(new Uint8Array([37, 80, 68, 70]));
});

describe('certificate API', () => {
  it('returns the issued certificate with its verification and LinkedIn links', async () => {
    repo.issueIfEligible.mockResolvedValue(cert);
    const body = await (await mine(new NextRequest('http://x/api/certificates?profileId=p1&skillId=logique'))).json();
    expect(body.certificate).toMatchObject({ reference: 'PP-0A1B2C3D', verifyUrl: 'https://playperform.fr/verifier/PP-0A1B2C3D?s=sig' });
    expect(body.certificate.linkedInAddUrl).toMatch(/^https:\/\/www\.linkedin\.com\/profile\/add\?/);
  });

  it('delivers the PDF to its holder only, never once revoked', async () => {
    repo.findCertificate.mockResolvedValue(cert);
    const res = await pdf(new NextRequest('http://x/api'), params);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toContain('certificat-PP-0A1B2C3D.pdf');
    jest.mocked(actorAuth.canAccessProfile).mockResolvedValue(false);
    expect((await pdf(new NextRequest('http://x/api'), params)).status).toBe(404);
    jest.mocked(actorAuth.canAccessProfile).mockResolvedValue(true);
    repo.findCertificate.mockResolvedValue({ ...cert, revokedAt: '2026-11-01' });
    expect((await pdf(new NextRequest('http://x/api'), params)).status).toBe(410);
  });

  it('lets only Play Perform revoke, with a reason', async () => {
    const del = (body: unknown) => new NextRequest('http://x/api', { method: 'DELETE', body: JSON.stringify(body) });
    jest.mocked(adminAuth.isAdminAuthorized).mockResolvedValue(false);
    expect((await revoke(del({ reason: 'Fraude avérée' }), params)).status).toBe(403);
    jest.mocked(adminAuth.isAdminAuthorized).mockResolvedValue(true);
    expect((await revoke(del({ reason: '' }), params)).status).toBe(400);
    repo.revokeCertificate.mockResolvedValue(true);
    expect((await revoke(del({ reason: 'Fraude avérée' }), params)).status).toBe(200);
  });
});
