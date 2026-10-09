import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { buildExaminerDashboard } from '@/modules/dashboards';
import { loadExaminerRows } from '@/modules/dashboards/server';
import { canCorrectEvaluations, organizationsWhere } from '@/modules/organizations';

/** GET → dashboard of the evaluations to correct, over the centres I am an examiner for. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const organizations = organizationsWhere(ctx, canCorrectEvaluations);
  if (organizations !== 'all' && organizations.length === 0) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const now = new Date();
    return NextResponse.json(buildExaminerDashboard(await loadExaminerRows(organizations, now), now));
  } catch (err) {
    console.error('[GET /api/dashboard/examiner]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
