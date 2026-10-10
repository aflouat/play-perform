import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { getThread, learnerNames, listMessages } from '@/modules/collab/server';

type Params = { params: Promise<{ id: string }> };

/** GET → the full transcript of a pair chat, open or archived (audit trail, parent company only). */
export async function GET(req: NextRequest, { params }: Params): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Réservé à la société mère' }, { status: 403 });
  try {
    const thread = await getThread((await params).id);
    if (!thread) return NextResponse.json({ error: 'Fil introuvable' }, { status: 404 });
    const [messages, names] = await Promise.all([listMessages(thread.id), learnerNames(thread.memberIds)]);
    const who = (id: string) => names.get(id) ?? { nickname: null, name: 'Élève supprimé' };
    return NextResponse.json({
      thread: { id: thread.id, project: thread.contextKey, opensAt: thread.opensAt, closesAt: thread.closesAt, members: thread.memberIds.map((id) => ({ id, ...who(id) })) },
      messages: messages.map((m) => ({ id: m.id, author: who(m.authorId), body: m.body, createdAt: m.createdAt, reportedAt: m.reportedAt })),
    });
  } catch (err) {
    console.error('[GET /api/audit/chats/:id]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
