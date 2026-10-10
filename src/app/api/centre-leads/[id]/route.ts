import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canDecideEnrollments } from '@/modules/organizations';
import { validateLeadStatus } from '@/modules/storefront';
import { organizationOfLead, setLeadStatus } from '@/modules/storefront/server';

type Params = { params: Promise<{ id: string }> };

/** PATCH { status } → the centre follows up a request (contacted, enrolled, closed). */
export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const validation = validateLeadStatus(await req.json().catch(() => null));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    const { id } = await params;
    const organizationId = await organizationOfLead(id);
    if (!organizationId || !canDecideEnrollments(ctx, organizationId)) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    await setLeadStatus(id, validation.value);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/centre-leads/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
