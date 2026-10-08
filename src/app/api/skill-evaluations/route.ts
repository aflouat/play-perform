import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getUserIdFromRequest } from '@/lib/actor-auth';
import {
  createEvaluation, getEvaluationPrompt, isStudentOfParent, listEvaluationsForProfile, listPendingEvaluations, validateSubmission,
} from '@/modules/skills/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?status=pending → evaluations to correct (admin) · GET ?profileId=… → a learner's evaluations (their parent). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = req.nextUrl;
  try {
    if (searchParams.get('status') === 'pending') {
      if (!(await isAdminAuthorized(req))) return fail('Non autorisé', 403);
      return NextResponse.json({ evaluations: await listPendingEvaluations() });
    }
    const profileId = searchParams.get('profileId') ?? '';
    const userId = await getUserIdFromRequest(req);
    if (!userId) return fail('Non autorisé', 401);
    if (!(await isStudentOfParent(userId, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ evaluations: await listEvaluationsForProfile(profileId) });
  } catch (err) {
    console.error('[GET /api/skill-evaluations]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST → a learner submits an answer (through their teacher's or their own session). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) return fail('Non autorisé', 401);
  const validation = validateSubmission(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  const { profileId, skillId, level } = validation.value;
  try {
    if (!(await isStudentOfParent(userId, profileId))) return fail('Élève introuvable', 404);
    const created = await createEvaluation(validation.value, getEvaluationPrompt(skillId, level));
    if (!created) return fail('Une évaluation de ce niveau attend déjà sa correction.', 409);
    return NextResponse.json({ evaluation: created }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/skill-evaluations]', err);
    return fail('Erreur serveur', 500);
  }
}
