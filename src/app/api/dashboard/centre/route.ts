import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { buildCentreDashboard } from '@/modules/dashboards';
import { loadCentreInput } from '@/modules/dashboards/server';
import { canManageStudents, studentOrganization } from '@/modules/organizations';

/**
 * GET → dashboard of my centre. A centre manager (and the super admin, for the parent company) sees the whole centre;
 * a teacher sees the students they added.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const organizationId = studentOrganization(ctx);
  if (!canManageStudents(ctx, organizationId)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const wholeCentre = ctx.isSuperAdmin || ctx.memberships.some((m) => m.organizationId === organizationId && m.role === 'org_admin');
  try {
    const now = new Date();
    const input = await loadCentreInput({ organizationId, ownerUserId: wholeCentre ? null : ctx.userId }, now);
    return NextResponse.json(buildCentreDashboard(input, now));
  } catch (err) {
    console.error('[GET /api/dashboard/centre]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
