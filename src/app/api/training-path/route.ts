import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { getTrainingPaths, validatePathChoice } from '@/modules/dashboards';
import { readTrainingPath, writeTrainingPath } from '@/modules/dashboards/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?profileId=… → { pathId } : the learner's training path (the learner or their teacher). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    return NextResponse.json({ pathId: await readTrainingPath(profileId) });
  } catch (err) {
    console.error('[GET /api/training-path]', err);
    return fail('Erreur serveur', 500);
  }
}

/** PUT { profileId, pathId } → the centre assigns or changes the path; a learner only picks a first one. */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = await req.json().catch(() => null);
  const profileId = typeof body?.profileId === 'string' ? body.profileId : '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const ids = getTrainingPaths().map((p) => p.id);
    const choice = validatePathChoice(body, actor.kind, await readTrainingPath(profileId), ids);
    if (!choice.ok) return fail(choice.error, choice.status);
    await writeTrainingPath(profileId, choice.value);
    return NextResponse.json({ pathId: choice.value });
  } catch (err) {
    console.error('[PUT /api/training-path]', err);
    return fail('Erreur serveur', 500);
  }
}
