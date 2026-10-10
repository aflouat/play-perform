import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { examinerStatus } from '@/modules/exams/server';

/** GET → the centres where the caller may give orals, their free slots and the learners waiting (notice + agenda). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    return NextResponse.json(await examinerStatus(ctx.userId));
  } catch (err) {
    console.error('[GET /api/oral-examiner/status]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
