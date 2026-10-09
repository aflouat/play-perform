import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canCorrectEvaluations } from '@/modules/organizations';
import { recordMilestone } from '@/modules/competition/server';
import { correctEvaluation, organizationOfEvaluation, validateCorrection } from '@/modules/skills/server';

type Params = { params: Promise<{ id: string }> };

/** PATCH /api/skill-evaluations/:id → the examiner passes or fails a pending evaluation (examiners of the learner's centre). */
export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  const validation = validateCorrection(await req.json().catch(() => null));
  if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
  try {
    const { id } = await params;
    const organizationId = await organizationOfEvaluation(id);
    if (!organizationId || !canCorrectEvaluations(ctx, organizationId)) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    const evaluation = await correctEvaluation(id, validation.value);
    if (!evaluation) return NextResponse.json({ error: 'Évaluation introuvable ou déjà corrigée' }, { status: 404 });
    if (evaluation.status === 'passed') await recordMilestone(evaluation.profileId, evaluation.skillId, Math.min(5, evaluation.level + 1));
    return NextResponse.json({ evaluation });
  } catch (err) {
    console.error('[PATCH /api/skill-evaluations]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
