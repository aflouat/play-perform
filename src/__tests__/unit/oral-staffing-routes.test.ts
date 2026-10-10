/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET as staff, PUT as grant } from '@/app/api/oral-staff/route';
import { POST as askOral } from '@/app/api/oral-requests/route';
import { GET as waitingList } from '@/app/api/oral-requests/centre/route';
import { DELETE as dropRequest } from '@/app/api/oral-requests/[id]/route';
import * as accessContext from '@/lib/access-context';
import * as actorAuth from '@/lib/actor-auth';
import * as organizations from '@/modules/organizations/server';
import * as server from '@/modules/exams/server';

jest.mock('@/lib/access-context');
jest.mock('@/lib/actor-auth');
jest.mock('@/modules/organizations/server');
jest.mock('@/modules/exams/server');

const repo = jest.mocked(server);
const ctx = (role: 'org_admin' | 'teacher', org = 'org-1') => ({ userId: 'u-boss', email: 'b@x', isSuperAdmin: false, memberships: [{ organizationId: org, role }] });
const req = (url: string, method = 'GET', body?: unknown) => new NextRequest(`http://x${url}`, { method, body: body ? JSON.stringify(body) : undefined });

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(organizations.listMembers).mockResolvedValue([
    { userId: 'u-teacher', email: 't@x', role: 'teacher' }, { userId: 'u-boss', email: 'b@x', role: 'org_admin' }]);
  jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  jest.mocked(actorAuth.canAccessProfile).mockResolvedValue(true);
});

describe('"peut faire passer les oraux" (centre manager)', () => {
  it('the manager lists the staff and enables a teacher', async () => {
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(ctx('org_admin'));
    repo.oralStaff.mockResolvedValue([]);
    expect((await staff(req('/api/oral-staff?organizationId=org-1'))).status).toBe(200);
    expect((await grant(req('/api/oral-staff', 'PUT', { organizationId: 'org-1', userId: 'u-teacher', enabled: true }))).status).toBe(200);
    expect(repo.setOralExaminer).toHaveBeenCalledWith('org-1', 'u-teacher', true, 'u-boss');
  });

  it('a plain teacher cannot, nor a manager of another centre; a manager cannot enable themselves as manager only', async () => {
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(ctx('teacher'));
    expect((await grant(req('/api/oral-staff', 'PUT', { organizationId: 'org-1', userId: 'u-teacher', enabled: true }))).status).toBe(403);
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(ctx('org_admin', 'org-2'));
    expect((await staff(req('/api/oral-staff?organizationId=org-1'))).status).toBe(403);
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(ctx('org_admin'));
    expect((await grant(req('/api/oral-staff', 'PUT', { organizationId: 'org-1', userId: 'u-boss', enabled: true }))).status).toBe(400);
  });
});

describe('waiting list for the final oral', () => {
  it('the learner joins it through the service; an existing request answers 200', async () => {
    repo.requestOral.mockResolvedValue({ status: 201 });
    expect((await askOral(req('/api/oral-requests', 'POST', { profileId: 'p1', skillId: 'logique' }))).status).toBe(201);
    repo.requestOral.mockResolvedValue({ status: 200, error: 'Tu es déjà sur la liste d’attente.' });
    expect((await askOral(req('/api/oral-requests', 'POST', { profileId: 'p1', skillId: 'logique' }))).status).toBe(200);
    repo.requestOral.mockResolvedValue({ status: 409, error: 'Des créneaux sont disponibles' });
    expect((await askOral(req('/api/oral-requests', 'POST', { profileId: 'p1', skillId: 'logique' }))).status).toBe(409);
  });

  it('the centre sees its waiting learners with their names and can remove one', async () => {
    jest.mocked(accessContext.getAccessContext).mockResolvedValue(ctx('teacher'));
    repo.listWaitingRequests.mockResolvedValue([{ id: 'r1', profileId: 'p1', organizationId: 'org-1', skillId: 'logique', level: 4, status: 'waiting', createdAt: '2026-10-10' }]);
    repo.studentNames.mockResolvedValue(new Map([['p1', 'Léa Martin']]));
    const res = await waitingList(req('/api/oral-requests/centre'));
    expect((await res.json()).requests[0]).toMatchObject({ id: 'r1', studentName: 'Léa Martin' });
    expect(repo.listWaitingRequests).toHaveBeenCalledWith(['org-1']);
    repo.organizationOfRequest.mockResolvedValue('org-2');
    expect((await dropRequest(req('/api/oral-requests/r1', 'DELETE'), { params: Promise.resolve({ id: 'r1' }) })).status).toBe(404);
    repo.organizationOfRequest.mockResolvedValue('org-1');
    expect((await dropRequest(req('/api/oral-requests/r1', 'DELETE'), { params: Promise.resolve({ id: 'r1' }) })).status).toBe(200);
    expect(repo.resolveRequests).toHaveBeenCalledWith({ id: 'r1' }, 'cancelled');
  });
});
