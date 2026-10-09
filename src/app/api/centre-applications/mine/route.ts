import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { latestApplicationOf } from '@/modules/organizations/server';

/** GET → the latest application filed with my e-mail (status banner of my space), or null. */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  try {
    return NextResponse.json({ application: await latestApplicationOf(ctx.email) });
  } catch (err) {
    console.error('[GET /api/centre-applications/mine]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
