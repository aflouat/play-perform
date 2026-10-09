/** @jest-environment node */
import { NextRequest } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import * as accessContext from '@/lib/access-context';

jest.mock('@/lib/access-context');
const ctxOf = jest.mocked(accessContext.getAccessContext);
const req = new NextRequest('http://localhost/api/x', { headers: { authorization: 'Bearer t' } });

describe('isAdminAuthorized (shared resources: super admin only)', () => {
  it('accepts every kind of super admin, ADMIN_EMAILS or platform_admins alike', async () => {
    ctxOf.mockResolvedValue({ userId: 'u', email: 'a@x.fr', isSuperAdmin: true, memberships: [] });
    expect(await isAdminAuthorized(req)).toBe(true);
  });
  it('refuses a centre manager, an examiner and anonymous callers', async () => {
    ctxOf.mockResolvedValue({ userId: 'u', email: 'a@x.fr', isSuperAdmin: false, memberships: [{ organizationId: 'o', role: 'org_admin' }] });
    expect(await isAdminAuthorized(req)).toBe(false);
    ctxOf.mockResolvedValue(null);
    expect(await isAdminAuthorized(req)).toBe(false);
  });
});
