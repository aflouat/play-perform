import { NextRequest, NextResponse } from 'next/server';
import { getActorFromRequest } from '@/lib/actor-auth';
import { isValidAnswer, loadDistributions, recordAnswers } from '@/modules/community/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?ids=q1,q2 → how learners answered these questions (counts per option, anonymous). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!(await getActorFromRequest(req))) return fail('Non autorisé', 401);
  const ids = (req.nextUrl.searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 20);
  try {
    return NextResponse.json({ distributions: await loadDistributions(ids) });
  } catch (err) {
    console.error('[GET /api/stats/answers]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { answers: [{ questionId, optionId }] } → adds a finished quiz to the statistics. The learner is not recorded. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!(await getActorFromRequest(req))) return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as { answers?: unknown } | null;
  if (!Array.isArray(body?.answers) || body.answers.length > 20 || !body.answers.every(isValidAnswer)) return fail('Requête invalide.', 400);
  try {
    await recordAnswers(body.answers);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/stats/answers]', err);
    return fail('Erreur serveur', 500);
  }
}
