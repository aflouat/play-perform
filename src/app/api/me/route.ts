import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { listOrganizations } from '@/modules/organizations/server';

/** GET → who I am: e-mail, super admin flag, and my centres with my role in each. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const organizations = await listOrganizations(ctx.memberships.map((m) => m.organizationId)).catch(() => []);
  const names = new Map(organizations.map((o) => [o.id, o.name]));
  return NextResponse.json({
    email: ctx.email,
    isSuperAdmin: ctx.isSuperAdmin,
    memberships: ctx.memberships.map((m) => ({ ...m, organizationName: names.get(m.organizationId) ?? '' })),
  });
}
