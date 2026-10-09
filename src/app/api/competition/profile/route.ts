import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { validateNickname } from '@/modules/competition';
import { updateRankingProfile } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** PUT { profileId, nickname?, showInRanking? } → the teacher sets a student's pseudonym or hides them from the ranking. */
export async function PUT(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'teacher') return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (typeof body?.profileId !== 'string') return fail('Requête invalide.', 400);
  const patch: { nickname?: string; showInRanking?: boolean } = {};
  if (body.nickname !== undefined) {
    const nickname = validateNickname(body.nickname);
    if (!nickname.ok) return fail(nickname.error, 400);
    patch.nickname = nickname.value;
  }
  if (body.showInRanking !== undefined) {
    if (typeof body.showInRanking !== 'boolean') return fail('Requête invalide.', 400);
    patch.showInRanking = body.showInRanking;
  }
  try {
    if (!(await canAccessProfile(actor, body.profileId))) return fail('Élève introuvable', 404);
    return (await updateRankingProfile(body.profileId, patch)) === 'taken'
      ? fail('Ce pseudo est déjà pris dans le centre.', 409)
      : NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PUT /api/competition/profile]', err);
    return fail('Erreur serveur', 500);
  }
}
