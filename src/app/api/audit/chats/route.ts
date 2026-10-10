import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { chatState } from '@/modules/collab';
import { learnerNames, listThreadsForAudit } from '@/modules/collab/server';

/** GET ?reported=1 → every pair chat (audit trail, parent company only), with pseudonyms and real names. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Réservé à la société mère' }, { status: 403 });
  try {
    const threads = await listThreadsForAudit(req.nextUrl.searchParams.get('reported') === '1');
    const names = await learnerNames([...new Set(threads.flatMap((t) => t.memberIds))]);
    const now = new Date();
    return NextResponse.json({ threads: threads.map((t) => ({
      id: t.id, organizationId: t.organizationId, project: t.contextKey, state: chatState(t, now), opensAt: t.opensAt, closesAt: t.closesAt,
      messageCount: t.messageCount, reportCount: t.reportCount, members: t.memberIds.map((id) => ({ id, ...(names.get(id) ?? { nickname: null, name: 'Élève supprimé' }) })),
    })) });
  } catch (err) {
    console.error('[GET /api/audit/chats]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
