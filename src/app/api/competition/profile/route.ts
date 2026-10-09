import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { updateRankingProfile } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** PUT { profileId, showInRanking } → the teacher hides a student from the ranking (the pseudonym itself is set through /api/profile). */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'teacher') return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (typeof body?.profileId !== 'string') return fail('Requête invalide.', 400);
  if (typeof body.showInRanking !== 'boolean') return fail('Requête invalide.', 400);
  const patch = { showInRanking: body.showInRanking };
  try {
    if (!(await canAccessProfile(actor, body.profileId))) return fail('Élève introuvable', 404);
    await updateRankingProfile(body.profileId, patch);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/competition/profile]', err);
    return fail('Erreur serveur', 500);
  }
}
