import { NextRequest, NextResponse } from 'next/server';
import { allowAttempt } from '@/lib/rate-limit';
import { validateLead } from '@/modules/storefront';
import { getPublicCentre, insertLead } from '@/modules/storefront/server';
import { choosablePathIds } from '@/modules/dashboards/server';

type Params = { params: Promise<{ slug: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** POST → a visitor of the centre's page asks to be contacted (public, 5 per hour and IP). */
export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allowAttempt(`centre-lead:${ip}`, 5, 60 * 60 * 1000)) return fail('Trop de demandes. Réessaie plus tard.', 429);
  try {
    const { slug } = await params;
    const centre = await getPublicCentre(slug);
    if (!centre) return fail('Centre introuvable', 404);
    const validation = validateLead(await req.json().catch(() => null), await choosablePathIds());
    if (!validation.ok) return fail(validation.error, 400);
    await insertLead(centre.id, validation.value);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/centres/:slug/leads]', err);
    return fail('Erreur serveur', 500);
  }
}
