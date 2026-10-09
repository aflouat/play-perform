import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { canCheer } from '@/modules/competition';
import { addCheer, eventInfo, organizationOf } from '@/modules/competition/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** POST { profileId, eventId } → "Bravo 👏" on a friend's success (same centre, once, not on your own). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const body = (await req.json().catch(() => null)) as { profileId?: unknown; eventId?: unknown } | null;
  if (typeof body?.profileId !== 'string' || typeof body.eventId !== 'string') return fail('Requête invalide.', 400);
  try {
    if (!(await canAccessProfile(actor, body.profileId))) return fail('Élève introuvable', 404);
    const event = await eventInfo(body.eventId);
    if (!event || event.organizationId !== (await organizationOf(body.profileId))) return fail('Réussite introuvable', 404);
    if (!canCheer({ profileId: event.profileId }, body.profileId, false)) return fail('Tu ne peux pas t’applaudir toi-même 😉', 400);
    return (await addCheer(body.eventId, body.profileId))
      ? NextResponse.json({ ok: true }, { status: 201 })
      : fail('Tu as déjà applaudi.', 409);
  } catch (err) {
    console.error('[POST /api/competition/cheer]', err);
    return fail('Erreur serveur', 500);
  }
}
