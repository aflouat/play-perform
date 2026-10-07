import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { fetchPlans } from '@/modules/pricing/server';

/** GET /api/pricing → active plans (public). ?all=1 → every plan (admin). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const all = req.nextUrl.searchParams.get('all') === '1';
  if (all && !(await isAdminAuthorized(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  try {
    return NextResponse.json({ plans: await fetchPlans({ activeOnly: !all }) });
  } catch (err) {
    console.error('[GET /api/pricing]', err);
    return NextResponse.json({ plans: [] }, { status: 503 });
  }
}
