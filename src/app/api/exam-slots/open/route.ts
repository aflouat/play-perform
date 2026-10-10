import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { MIN_NOTICE_HOURS } from '@/modules/exams';
import { listOpenSlots, studentOrganization } from '@/modules/exams/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });
const HOUR_MS = 60 * 60 * 1000;
const DAYS_SHOWN = 30;

/** GET ?profileId=… → free slots of the learner's centre, from 2 h ahead to 30 days (the learner or their teacher). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const organizationId = await studentOrganization(profileId);
    if (!organizationId) return NextResponse.json({ slots: [] });
    const now = Date.now();
    const from = new Date(now + MIN_NOTICE_HOURS * HOUR_MS).toISOString();
    const to = new Date(now + DAYS_SHOWN * 24 * HOUR_MS).toISOString();
    return NextResponse.json({ slots: await listOpenSlots(organizationId, from, to) });
  } catch (err) {
    console.error('[GET /api/exam-slots/open]', err);
    return fail('Erreur serveur', 500);
  }
}
