import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { getServerClient } from '@/lib/db/client';
import { isWeek, pastAwardsOf } from '@/modules/competition';
import { loadCompetitionData, revokeAward } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET → medals of the last weeks held by MY students (with ids, so that I can remove one). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'teacher') return fail('Non autorisé', 401);
  try {
    const { data } = await getServerClient().from('students').select('id, organization_id').eq('parent_id', actor.userId);
    const mine = (data ?? []) as { id: string; organization_id: string }[];
    const myIds = new Set(mine.map((s) => s.id));
    const awards: { week: string; profileId: string; nickname: string; medal: string }[] = [];
    for (const organizationId of new Set(mine.map((s) => s.organization_id))) {
      const first = mine.find((s) => s.organization_id === organizationId);
      const centre = await loadCompetitionData(organizationId, first?.id ?? '');
      for (const past of pastAwardsOf(centre, new Date())) {
        for (const award of past.awards) if (myIds.has(award.profileId)) awards.push({ week: past.week, ...award });
      }
    }
    return NextResponse.json({ awards });
  } catch (err) {
    console.error('[GET /api/competition/awards]', err);
    return fail('Erreur serveur', 500);
  }
}

/** DELETE { profileId, week } → the teacher removes an automatic medal of their student. */
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'teacher') return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (typeof body?.profileId !== 'string' || !isWeek(body.week)) return fail('Requête invalide.', 400);
  try {
    if (!(await canAccessProfile(actor, body.profileId))) return fail('Élève introuvable', 404);
    await revokeAward(body.profileId, body.week);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/competition/awards]', err);
    return fail('Erreur serveur', 500);
  }
}
