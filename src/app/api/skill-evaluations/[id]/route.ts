import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { correctEvaluation, validateCorrection } from '@/modules/skills/server';

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/skill-evaluations/:id → the examiner passes or fails a pending evaluation (admin). */
export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const validation = validateCorrection(await req.json().catch(() => null));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    const { id } = await params;
    const evaluation = await correctEvaluation(id, validation.value);
    if (!evaluation) return NextResponse.json({ error: 'Évaluation introuvable ou déjà corrigée' }, { status: 404 });
    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error('[PATCH /api/skill-evaluations]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
