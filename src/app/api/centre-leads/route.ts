import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { canDecideEnrollments, organizationsWhere } from '@/modules/organizations';
import { listLeads } from '@/modules/storefront/server';

/** GET → information requests of the caller's centres (manager, teacher; the parent company sees all). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    return NextResponse.json({ leads: await listLeads(organizationsWhere(ctx, canDecideEnrollments)) });
  } catch (err) {
    console.error('[GET /api/centre-leads]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
