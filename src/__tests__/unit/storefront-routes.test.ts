/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST as leave } from '@/app/api/centres/[slug]/leads/route';
import { GET as list } from '@/app/api/centre-leads/route';
import { PATCH as follow } from '@/app/api/centre-leads/[id]/route';
import * as accessContext from '@/lib/access-context';
import * as server from '@/modules/storefront/server';
import * as dashboards from '@/modules/dashboards/server';

jest.mock('@/lib/access-context');
jest.mock('@/modules/storefront/server');
jest.mock('@/modules/dashboards/server');

const repo = jest.mocked(server);
const centre = { id: 'org-1', name: 'Centre Alpha', slug: 'centre-alpha', address: null, postalCode: null, city: 'Lyon' };
const req = (body?: unknown, ip = '1.1.1.1') => new NextRequest('http://x/api', { method: 'POST', body: body ? JSON.stringify(body) : undefined, headers: { 'x-forwarded-for': ip } });
const params = <T extends string>(key: T, value: string) => ({ params: Promise.resolve({ [key]: value } as Record<T, string>) });
const lead = { firstName: 'Léa', contact: 'lea@example.fr', pathId: 'technicien-laboratoire', message: '', consent: true };
const teacher = (org: string) => ({ userId: 'u1', email: 't@x', isSuperAdmin: false, memberships: [{ organizationId: org, role: 'teacher' as const }] });

beforeEach(() => {
  jest.resetAllMocks();
  repo.getPublicCentre.mockResolvedValue(centre);
  jest.mocked(dashboards.choosablePathIds).mockResolvedValue(['technicien-laboratoire']);
});

describe('information request from a centre’s page', () => {
  it('is public and recorded for that centre', async () => {
    expect((await leave(req(lead, '2.2.2.2'), params('slug', 'centre-alpha'))).status).toBe(201);
    expect(repo.insertLead).toHaveBeenCalledWith('org-1', expect.objectContaining({ firstName: 'Léa', pathId: 'technicien-laboratoire' }));
  });

  it('refuses an unknown centre, an invalid request, and more than 5 per hour from one address', async () => {
    repo.getPublicCentre.mockResolvedValue(null);
    expect((await leave(req(lead, '3.3.3.3'), params('slug', 'nope'))).status).toBe(404);
    repo.getPublicCentre.mockResolvedValue(centre);
    expect((await leave(req({ ...lead, consent: false }, '3.3.3.3'), params('slug', 'centre-alpha'))).status).toBe(400);
    for (let i = 0; i < 3; i++) await leave(req(lead, '3.3.3.3'), params('slug', 'centre-alpha'));
    expect((await leave(req(lead, '3.3.3.3'), params('slug', 'centre-alpha'))).status).toBe(429);
  });
});

describe('the centre follows up its requests', () => {
  it('lists only the requests of its own centres', async () => {
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(teacher('org-1'));
    repo.listLeads.mockResolvedValue([]);
    expect((await list(new NextRequest('http://x/api'))).status).toBe(200);
    expect(repo.listLeads).toHaveBeenCalledWith(['org-1']);
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(null);
    expect((await list(new NextRequest('http://x/api'))).status).toBe(403);
  });

  it('changes the status of its requests, not another centre’s', async () => {
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(teacher('org-1'));
    repo.organizationOfLead.mockResolvedValue('org-1');
    expect((await follow(req({ status: 'contacted' }), params('id', 'l1'))).status).toBe(200);
    expect(repo.setLeadStatus).toHaveBeenCalledWith('l1', 'contacted');
    repo.organizationOfLead.mockResolvedValue('org-2');
    expect((await follow(req({ status: 'contacted' }), params('id', 'l2'))).status).toBe(404);
  });
});
