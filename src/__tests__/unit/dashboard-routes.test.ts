/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET as centre } from '@/app/api/dashboard/centre/route';
import { GET as examiner } from '@/app/api/dashboard/examiner/route';
import * as accessContext from '@/lib/access-context';
import * as repo from '@/modules/dashboards/server';
import { DEFAULT_ORGANIZATION_ID, type AccessContext } from '@/modules/organizations';

jest.mock('@/lib/access-context');
jest.mock('@/modules/dashboards/server');

const ctxOf = jest.mocked(accessContext.getAccessContext);
const db = jest.mocked(repo);
const req = () => new NextRequest('http://localhost/api/dashboard', { headers: { authorization: 'Bearer t' } });
const ctx = (over: Partial<AccessContext>): AccessContext => ({ userId: 'u1', email: 'u@x.fr', isSuperAdmin: false, memberships: [], ...over });
const empty = { students: [], pendingEnrollments: 0, pendingEvaluations: 0, challengePlayers: 0 };

beforeEach(() => { jest.resetAllMocks(); db.loadCentreInput.mockResolvedValue(empty); db.loadExaminerRows.mockResolvedValue([]); });

describe('GET /api/dashboard/centre', () => {
  it('shows a teacher only the students they added', async () => {
    ctxOf.mockResolvedValue(ctx({ memberships: [{ organizationId: 'centre-a', role: 'teacher' }] }));
    expect((await centre(req())).status).toBe(200);
    expect(db.loadCentreInput).toHaveBeenCalledWith({ organizationId: 'centre-a', ownerUserId: 'u1' }, expect.any(Date));
  });

  it('shows a centre manager the whole centre', async () => {
    ctxOf.mockResolvedValue(ctx({ memberships: [{ organizationId: 'centre-a', role: 'org_admin' }] }));
    await centre(req());
    expect(db.loadCentreInput).toHaveBeenCalledWith({ organizationId: 'centre-a', ownerUserId: null }, expect.any(Date));
  });

  it('shows the super admin the parent company', async () => {
    ctxOf.mockResolvedValue(ctx({ isSuperAdmin: true }));
    await centre(req());
    expect(db.loadCentreInput).toHaveBeenCalledWith({ organizationId: DEFAULT_ORGANIZATION_ID, ownerUserId: null }, expect.any(Date));
  });

  it('refuses an examiner, and anonymous callers', async () => {
    ctxOf.mockResolvedValue(ctx({ memberships: [{ organizationId: 'centre-a', role: 'examiner' }] }));
    expect((await centre(req())).status).toBe(403);
    ctxOf.mockResolvedValue(null);
    expect((await centre(req())).status).toBe(401);
    expect(db.loadCentreInput).not.toHaveBeenCalled();
  });
});

describe('GET /api/dashboard/examiner', () => {
  it('covers every centre the examiner is attached to', async () => {
    ctxOf.mockResolvedValue(ctx({ memberships: [{ organizationId: 'a', role: 'examiner' }, { organizationId: 'b', role: 'examiner' }, { organizationId: 'c', role: 'teacher' }] }));
    expect((await examiner(req())).status).toBe(200);
    expect(db.loadExaminerRows).toHaveBeenCalledWith(['a', 'b'], expect.any(Date));
  });

  it('covers everything for the super admin', async () => {
    ctxOf.mockResolvedValue(ctx({ isSuperAdmin: true }));
    await examiner(req());
    expect(db.loadExaminerRows).toHaveBeenCalledWith('all', expect.any(Date));
  });

  it('refuses someone who corrects nowhere', async () => {
    ctxOf.mockResolvedValue(ctx({ memberships: [{ organizationId: 'a', role: 'teacher' }] }));
    expect((await examiner(req())).status).toBe(403);
  });
});
