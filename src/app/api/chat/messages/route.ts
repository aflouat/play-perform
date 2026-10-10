import { NextRequest, NextResponse } from 'next/server';
import { getActorFromRequest } from '@/lib/actor-auth';
import { allowAttempt } from '@/lib/rate-limit';
import { MESSAGES_PER_MINUTE, chatState, validateMessage } from '@/modules/collab';
import { currentPairThread, insertMessage } from '@/modules/collab/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** POST { threadId, body } → a message in my pair's chat, while the project is open (learner session only). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor || actor.kind !== 'learner') return fail('Réservé aux apprenants', 403);
  const body = (await req.json().catch(() => null)) as { threadId?: unknown; body?: unknown } | null;
  const message = validateMessage(body?.body);
  if (!message.ok) return fail(message.error, 400);
  if (!allowAttempt(`chat:${actor.profileId}`, MESSAGES_PER_MINUTE, 60_000)) return fail('Doucement : trop de messages en une minute.', 429);
  try {
    const now = new Date();
    const current = await currentPairThread(actor.profileId, now);
    if (!current || current.thread.id !== body?.threadId) return fail('Ce chat n’est pas (ou plus) celui de ton binôme.', 403);
    if (chatState(current.thread, now) === 'archived') return fail('Le projet est terminé : ce chat est archivé.', 409);
    const saved = await insertMessage(current.thread.id, actor.profileId, message.value);
    return NextResponse.json({ id: saved.id, createdAt: saved.createdAt }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/chat/messages]', err);
    return fail('Erreur serveur', 500);
  }
}
