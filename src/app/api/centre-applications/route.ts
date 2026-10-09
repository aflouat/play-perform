import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { allowAttempt } from '@/lib/rate-limit';
import { validateCentreApplication } from '@/modules/organizations';
import { listPendingApplications, submitApplication } from '@/modules/organizations/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** POST → a new centre applies (public, rate-limited). The account itself is created separately by the sign-up form. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!allowAttempt(`centre-application:${ip}`, 5, 60 * 60 * 1000)) return fail('Trop de demandes. Réessaie plus tard.', 429);
  const validation = validateCentreApplication(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    const result = await submitApplication(validation.value);
    return result.ok ? NextResponse.json({ ok: true }, { status: 201 }) : fail('Un centre avec ce SIRET existe déjà ou a déjà déposé un dossier.', 409);
  } catch (err) {
    console.error('[POST /api/centre-applications]', err);
    return fail('Erreur serveur', 500);
  }
}

/** GET → applications waiting for a decision (super admin). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx?.isSuperAdmin) return fail('Non autorisé', 403);
  try {
    return NextResponse.json({ applications: await listPendingApplications() });
  } catch (err) {
    console.error('[GET /api/centre-applications]', err);
    return fail('Erreur serveur', 500);
  }
}
