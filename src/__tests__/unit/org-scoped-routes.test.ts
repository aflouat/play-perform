/** @jest-environment node */
import { NextRequest } from 'next/server';
import { PATCH } from '@/app/api/skill-evaluations/[id]/route';
import { GET } from '@/app/api/skill-evaluations/route';
import { PATCH as PATCH_ENROLLMENT } from '@/app/api/skill-enrollments/[id]/route';
import * as accessContext from '@/lib/access-context';
import * as skillsServer from '@/modules/skills/server';
import type { AccessContext } from '@/modules/organizations';

jest.mock('@/lib/access-context');
jest.mock('@/modules/skills/server', () => ({
  ...jest.requireActual('@/modules/skills/server'),
  organizationOfEvaluation: jest.fn(),
  organizationOfEnrollment: jest.fn(),
  correctEvaluation: jest.fn(),
  decideEnrollment: jest.fn(),
  listPendingEvaluations: jest.fn(),
}));

const ctxOf = jest.mocked(accessContext.getAccessContext);
const server = jest.mocked(skillsServer);
const CENTRE_A = 'centre-a';
const CENTRE_B = 'centre-b';
const examinerOfA: AccessContext = { userId: 'u', email: 'e@x.fr', isSuperAdmin: false, memberships: [{ organizationId: CENTRE_A, role: 'examiner' }] };

const request = (url: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, { method, headers: { authorization: 'Bearer t', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const pass = { status: 'passed', comment: '' };

beforeEach(() => jest.resetAllMocks());

describe('correcting an evaluation', () => {
  it('lets an examiner of the learner’s centre correct it', async () => {
    ctxOf.mockResolvedValue(examinerOfA);
    server.organizationOfEvaluation.mockResolvedValue(CENTRE_A);
    server.correctEvaluation.mockResolvedValue({ id: 'e1' } as never);
    expect((await PATCH(request('/api/skill-evaluations/e1', 'PATCH', pass), params('e1'))).status).toBe(200);
  });

  it('refuses an examiner of another centre', async () => {
    ctxOf.mockResolvedValue(examinerOfA);
    server.organizationOfEvaluation.mockResolvedValue(CENTRE_B);
    expect((await PATCH(request('/api/skill-evaluations/e1', 'PATCH', pass), params('e1'))).status).toBe(403);
    expect(server.correctEvaluation).not.toHaveBeenCalled();
  });

  it('refuses a teacher (teachers do not correct) and anonymous callers', async () => {
    ctxOf.mockResolvedValue({ ...examinerOfA, memberships: [{ organizationId: CENTRE_A, role: 'teacher' }] });
    server.organizationOfEvaluation.mockResolvedValue(CENTRE_A);
    expect((await PATCH(request('/api/skill-evaluations/e1', 'PATCH', pass), params('e1'))).status).toBe(403);
    ctxOf.mockResolvedValue(null);
    expect((await PATCH(request('/api/skill-evaluations/e1', 'PATCH', pass), params('e1'))).status).toBe(403);
  });

  it('lets the super admin correct any centre', async () => {
    ctxOf.mockResolvedValue({ userId: 's', email: 's@x.fr', isSuperAdmin: true, memberships: [] });
    server.organizationOfEvaluation.mockResolvedValue(CENTRE_B);
    server.correctEvaluation.mockResolvedValue({ id: 'e1' } as never);
    expect((await PATCH(request('/api/skill-evaluations/e1', 'PATCH', pass), params('e1'))).status).toBe(200);
  });
});

describe('pending evaluations list', () => {
  it('is limited to the centres of an examiner, and unlimited for the super admin', async () => {
    server.listPendingEvaluations.mockResolvedValue([]);
    ctxOf.mockResolvedValue(examinerOfA);
    await GET(request('/api/skill-evaluations?status=pending', 'GET'));
    expect(server.listPendingEvaluations).toHaveBeenLastCalledWith([CENTRE_A]);
    ctxOf.mockResolvedValue({ userId: 's', email: 's', isSuperAdmin: true, memberships: [] });
    await GET(request('/api/skill-evaluations?status=pending', 'GET'));
    expect(server.listPendingEvaluations).toHaveBeenLastCalledWith('all');
  });
});

describe('deciding on an enrollment', () => {
  const approve = { status: 'approved' };
  it('lets a teacher of the centre decide but not an examiner', async () => {
    server.organizationOfEnrollment.mockResolvedValue(CENTRE_A);
    server.decideEnrollment.mockResolvedValue({ id: 'r1' } as never);
    ctxOf.mockResolvedValue({ ...examinerOfA, memberships: [{ organizationId: CENTRE_A, role: 'teacher' }] });
    expect((await PATCH_ENROLLMENT(request('/api/skill-enrollments/r1', 'PATCH', approve), params('r1'))).status).toBe(200);
    ctxOf.mockResolvedValue(examinerOfA);
    expect((await PATCH_ENROLLMENT(request('/api/skill-enrollments/r1', 'PATCH', approve), params('r1'))).status).toBe(403);
  });
});
