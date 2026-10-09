/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/skill-enrollments/route';
import { PATCH } from '@/app/api/skill-enrollments/[id]/route';
import * as actorAuth from '@/lib/actor-auth';
import * as accessContext from '@/lib/access-context';
import * as organizationsServer from '@/modules/organizations/server';
import * as skillsServer from '@/modules/skills/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/lib/access-context');
jest.mock('@/modules/organizations/server');
jest.mock('@/modules/skills/server', () => ({
  ...jest.requireActual('@/modules/skills/server'),
  createEnrollment: jest.fn(), listRecentEnrollments: jest.fn(), listPendingEnrollments: jest.fn(),
  organizationOfEnrollment: jest.fn(), decideEnrollment: jest.fn(),
}));

const actor = jest.mocked(actorAuth);
const ctxOf = jest.mocked(accessContext.getAccessContext);
const skills = jest.mocked(skillsServer);
const orgs = jest.mocked(organizationsServer);
const call = (url: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, { method, headers: { authorization: 'Bearer t', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
const teacher = { userId: 'u', email: 'u@x.fr', isSuperAdmin: false, memberships: [{ organizationId: 'centre-a', role: 'teacher' as const }] };

beforeEach(() => {
  jest.resetAllMocks();
  actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  actor.canAccessProfile.mockResolvedValue(true);
  orgs.organizationOfStudent.mockResolvedValue('centre-a');
});

describe('POST /api/skill-enrollments (automatic validation)', () => {
  it('enrolls a learner with no reason given, in their own centre', async () => {
    skills.createEnrollment.mockResolvedValue({ id: 'r1', status: 'approved' } as never);
    const res = await POST(call('/api/skill-enrollments', 'POST', { profileId: 'p1', skillId: 'logique' }));
    expect(res.status).toBe(201);
    expect(skills.createEnrollment).toHaveBeenCalledWith({ profileId: 'p1', skillId: 'logique', motivation: '' }, 'centre-a');
  });

  it('refuses a second enrollment in the same training', async () => {
    skills.createEnrollment.mockResolvedValue(null);
    expect((await POST(call('/api/skill-enrollments', 'POST', { profileId: 'p1', skillId: 'logique' }))).status).toBe(409);
  });

  it('refuses another learner’s profile and unknown skills', async () => {
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await POST(call('/api/skill-enrollments', 'POST', { profileId: 'p9', skillId: 'logique' }))).status).toBe(404);
    expect((await POST(call('/api/skill-enrollments', 'POST', { profileId: 'p1', skillId: 'nope' }))).status).toBe(400);
  });
});

describe('the centre’s side', () => {
  it('lists the recent enrollments of its centres only', async () => {
    ctxOf.mockResolvedValue(teacher);
    skills.listRecentEnrollments.mockResolvedValue([]);
    await GET(call('/api/skill-enrollments?status=recent', 'GET'));
    expect(skills.listRecentEnrollments).toHaveBeenCalledWith(['centre-a'], expect.any(String));
  });

  it('lets the centre withdraw an access with a reason, not an examiner', async () => {
    skills.organizationOfEnrollment.mockResolvedValue('centre-a');
    skills.decideEnrollment.mockResolvedValue({ id: 'r1' } as never);
    ctxOf.mockResolvedValue(teacher);
    const withdraw = { status: 'rejected', comment: 'Place réservée' };
    expect((await PATCH(call('/api/skill-enrollments/r1', 'PATCH', withdraw), { params: Promise.resolve({ id: 'r1' }) })).status).toBe(200);
    expect((await PATCH(call('/api/skill-enrollments/r1', 'PATCH', { status: 'rejected' }), { params: Promise.resolve({ id: 'r1' }) })).status).toBe(400);
    ctxOf.mockResolvedValue({ ...teacher, memberships: [{ organizationId: 'centre-a', role: 'examiner' }] });
    expect((await PATCH(call('/api/skill-enrollments/r1', 'PATCH', withdraw), { params: Promise.resolve({ id: 'r1' }) })).status).toBe(403);
  });
});
