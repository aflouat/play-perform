import { NextRequest, NextResponse } from 'next/server';
import { getActorFromRequest } from '@/lib/actor-auth';
import { chatState } from '@/modules/collab';
import { currentPairThread, listMessages } from '@/modules/collab/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?after=ISO → the chat of my pair for this week's project (learner session only), new messages after a date. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'learner') return fail('Réservé aux apprenants', 403);
  try {
    const now = new Date();
    const current = await currentPairThread(actor.profileId, now);
    if (!current) return NextResponse.json({ thread: null, messages: [] });
    const { thread, nicknames } = current;
    const messages = await listMessages(thread.id, req.nextUrl.searchParams.get('after'));
    return NextResponse.json({
      thread: {
        id: thread.id, closesAt: thread.closesAt, state: chatState(thread, now),
        members: thread.memberIds.map((id) => ({ nickname: nicknames.get(id) ?? 'Camarade', me: id === actor.profileId })),
      },
      messages: messages.map((m) => ({
        id: m.id, mine: m.authorId === actor.profileId, author: nicknames.get(m.authorId) ?? 'Camarade', body: m.body, createdAt: m.createdAt, reported: m.reportedAt !== null,
      })),
    });
  } catch (err) {
    console.error('[GET /api/chat]', err);
    return fail('Erreur serveur', 500);
  }
}
