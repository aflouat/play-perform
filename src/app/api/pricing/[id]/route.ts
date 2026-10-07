import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { isPlanId, validatePlanUpdate } from '@/modules/pricing';
import { updatePlan } from '@/modules/pricing/server';

type Params = { params: Promise<{ id: string }> };

/** PUT /api/pricing/:id → update a plan (admin). */
export async function PUT(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const { id } = await params;
  if (!isPlanId(id)) return NextResponse.json({ error: 'Offre inconnue' }, { status: 404 });

  const validation = validatePlanUpdate(await req.json().catch(() => null));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    return NextResponse.json({ plan: await updatePlan(id, validation.value) });
  } catch (err) {
    console.error('[PUT /api/pricing]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
