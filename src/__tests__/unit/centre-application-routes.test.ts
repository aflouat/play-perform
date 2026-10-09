/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/centre-applications/route';
import { PATCH } from '@/app/api/centre-applications/[id]/route';
import * as accessContext from '@/lib/access-context';
import * as organizationsServer from '@/modules/organizations/server';

jest.mock('@/lib/access-context');
jest.mock('@/modules/organizations/server');

const ctxOf = jest.mocked(accessContext.getAccessContext);
const repo = jest.mocked(organizationsServer);
const superAdmin = { userId: 's', email: 's@x.fr', isSuperAdmin: true, memberships: [] };
const manager = { userId: 'm', email: 'm@x.fr', isSuperAdmin: false, memberships: [{ organizationId: 'o', role: 'org_admin' as const }] };
const application = {
  email: 'contact@alpha.fr', legalName: 'Centre Alpha SAS', siren: '732829320', siret: '73282932000074',
  address: '12 rue des Écoles', postalCode: '75005', city: 'Paris',
};

const call = (url: string, method: string, body?: unknown, ip = '1.1.1.1') =>
  new NextRequest(`http://localhost${url}`, { method, headers: { 'content-type': 'application/json', 'x-forwarded-for': ip, authorization: 'Bearer t' }, body: body ? JSON.stringify(body) : undefined });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => jest.resetAllMocks());

describe('POST /api/centre-applications (public)', () => {
  it('files a valid application', async () => {
    repo.submitApplication.mockResolvedValue({ ok: true });
    const res = await POST(call('/api/centre-applications', 'POST', application, '2.2.2.2'));
    expect(res.status).toBe(201);
    expect(repo.submitApplication).toHaveBeenCalledWith(expect.objectContaining({ email: 'contact@alpha.fr', siret: '73282932000074' }));
  });

  it('refuses a wrong SIREN before touching the database', async () => {
    const res = await POST(call('/api/centre-applications', 'POST', { ...application, siren: '123456789' }, '3.3.3.3'));
    expect(res.status).toBe(400);
    expect(repo.submitApplication).not.toHaveBeenCalled();
  });

  it('reports an establishment that is already registered', async () => {
    repo.submitApplication.mockResolvedValue({ ok: false, reason: 'siret-taken' });
    expect((await POST(call('/api/centre-applications', 'POST', application, '4.4.4.4'))).status).toBe(409);
  });

  it('slows down a flood from one address', async () => {
    repo.submitApplication.mockResolvedValue({ ok: true });
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) statuses.push((await POST(call('/api/centre-applications', 'POST', application, '9.9.9.9'))).status);
    expect(statuses.slice(0, 5)).toEqual([201, 201, 201, 201, 201]);
    expect(statuses.slice(5)).toEqual([429, 429]);
  });
});

describe('reviewing applications', () => {
  it('is reserved to the super admin', async () => {
    ctxOf.mockResolvedValue(manager);
    expect((await GET(call('/api/centre-applications', 'GET'))).status).toBe(403);
    expect((await PATCH(call('/api/centre-applications/a1', 'PATCH', { status: 'approved' }), params('a1'))).status).toBe(403);
    expect(repo.decideApplication).not.toHaveBeenCalled();
  });

  it('lets the super admin open a centre, or explains why not', async () => {
    ctxOf.mockResolvedValue(superAdmin);
    repo.decideApplication.mockResolvedValue({ ok: true, application: { id: 'a1' } as never });
    expect((await PATCH(call('/api/centre-applications/a1', 'PATCH', { status: 'approved' }), params('a1'))).status).toBe(200);
    repo.decideApplication.mockResolvedValue({ ok: false, reason: 'no-account' });
    expect((await PATCH(call('/api/centre-applications/a1', 'PATCH', { status: 'approved' }), params('a1'))).status).toBe(409);
    repo.decideApplication.mockResolvedValue({ ok: false, reason: 'not-found' });
    expect((await PATCH(call('/api/centre-applications/a1', 'PATCH', { status: 'approved' }), params('a1'))).status).toBe(404);
  });

  it('requires a reason to refuse', async () => {
    ctxOf.mockResolvedValue(superAdmin);
    expect((await PATCH(call('/api/centre-applications/a1', 'PATCH', { status: 'rejected' }), params('a1'))).status).toBe(400);
  });
});
