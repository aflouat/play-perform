import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { eventInfo, hideEvent } from '@/modules/competition/server';

type Params = { params: Promise<{ id: string }> };

/** DELETE → the teacher removes a success from the feed (moderation). */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'teacher') return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    const { id } = await params;
    const event = await eventInfo(id);
    if (!event || !(await canAccessProfile(actor, event.profileId))) return NextResponse.json({ error: 'Réussite introuvable' }, { status: 404 });
    await hideEvent(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/competition/events]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
