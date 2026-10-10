import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canRecruit } from '@/modules/organizations';
import { listMembers } from '@/modules/organizations/server';
import { validateOralGrant } from '@/modules/exams';
import { oralStaff, setOralExaminer } from '@/modules/exams/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?organizationId=… → the centre's teachers and examiners: may they give orals, how many free slots (manager). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  const organizationId = req.nextUrl.searchParams.get('organizationId') ?? '';
  if (!ctx || !canRecruit(ctx, organizationId)) return fail('Non autorisé', 403);
  try {
    return NextResponse.json({ staff: await oralStaff(organizationId) });
  } catch (err) {
    console.error('[GET /api/oral-staff]', err);
    return fail('Erreur serveur', 500);
  }
}

/** PUT { organizationId, userId, enabled } → "peut faire passer les oraux" for a teacher or an examiner of the centre (manager). */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return fail('Non autorisé', 403);
  const body = await req.json().catch(() => null);
  const organizationId = typeof body?.organizationId === 'string' ? body.organizationId : '';
  if (!canRecruit(ctx, organizationId)) return fail('Réservé au responsable du centre', 403);
  try {
    const validation = validateOralGrant(body, await listMembers(organizationId));
    if (!validation.ok) return fail(validation.error, 400);
    await setOralExaminer(organizationId, validation.value.userId, validation.value.enabled, ctx.userId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/oral-staff]', err);
    return fail('Erreur serveur', 500);
  }
}
