import { NextRequest, NextResponse } from 'next/server';
import { getActorFromRequest } from '@/lib/actor-auth';
import { getMessage, getThread, reportMessage } from '@/modules/collab/server';

type Params = { params: Promise<{ id: string }> };

/** POST → a member of the pair reports a message of their partner to Play Perform. */
export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'learner') return NextResponse.json({ error: 'Réservé aux apprenants' }, { status: 403 });
  try {
    const message = await getMessage((await params).id);
    const thread = message && (await getThread(message.threadId));
    if (!message || !thread?.memberIds.includes(actor.profileId) || message.authorId === actor.profileId) {
      return NextResponse.json({ error: 'Message introuvable' }, { status: 404 });
    }
    await reportMessage(message.id, actor.profileId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[POST /api/chat/messages/:id/report]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
