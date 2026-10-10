import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canDecideEnrollments } from '@/modules/organizations';
import { organizationOfRequest, resolveRequests } from '@/modules/exams/server';

type Params = { params: Promise<{ id: string }> };

/** DELETE → the centre removes a learner from the waiting list (handled otherwise). Booking closes requests on its own. */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    const { id } = await params;
    const organizationId = await organizationOfRequest(id);
    if (!organizationId || !canDecideEnrollments(ctx, organizationId)) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    await resolveRequests({ id }, 'cancelled');
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/oral-requests/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
