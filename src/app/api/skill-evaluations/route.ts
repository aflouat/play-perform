import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { DEFAULT_ORGANIZATION_ID, canCorrectEvaluations, organizationsWhere } from '@/modules/organizations';
import { organizationOfStudent } from '@/modules/organizations/server';
import {
  createEvaluation, getEvaluationPrompt, listEvaluationsForProfile, listPendingEvaluations, validateSubmission,
} from '@/modules/skills/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?status=pending → evaluations to correct (examiners of the learner's centre) · GET ?profileId=… → a learner's evaluations (the learner or their teacher). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  try {
    if (searchParams.get('status') === 'pending') {
      const ctx = await getAccessContext(req);
      if (!ctx) return fail('Non autorisé', 403);
      return NextResponse.json({ evaluations: await listPendingEvaluations(organizationsWhere(ctx, canCorrectEvaluations)) });
    }
    const profileId = searchParams.get('profileId') ?? '';
    const actor = await getActorFromRequest(req);
    if (!actor) return fail('Non autorisé', 401);
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ evaluations: await listEvaluationsForProfile(profileId) });
  } catch (err) {
    console.error('[GET /api/skill-evaluations]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST → a learner submits an answer (through their teacher's or their own session). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const validation = validateSubmission(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  const { profileId, skillId, level } = validation.value;
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const organizationId = (await organizationOfStudent(profileId)) ?? DEFAULT_ORGANIZATION_ID;
    const created = await createEvaluation(validation.value, getEvaluationPrompt(skillId, level), organizationId);
    if (!created) return fail('Une évaluation de ce niveau attend déjà sa correction.', 409);
    return NextResponse.json({ evaluation: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skill-evaluations]', err);
    return fail('Erreur serveur', 500);
  }
}
