import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canDecideEnrollments, organizationsWhere } from '@/modules/organizations';
import { listWaitingRequests, studentNames } from '@/modules/exams/server';

/** GET → learners of the caller's centres waiting for an examiner (manager, teacher; the parent company sees all). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const requests = await listWaitingRequests(organizationsWhere(ctx, canDecideEnrollments));
    const names = await studentNames([...new Set(requests.map((r) => r.profileId))]);
    return NextResponse.json({ requests: requests.map((r) => ({ ...r, studentName: names.get(r.profileId) ?? 'Élève' })) });
  } catch (err) {
    console.error('[GET /api/oral-requests/centre]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
