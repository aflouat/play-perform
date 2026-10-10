import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { validateBookingRequest } from '@/modules/exams';
import { bookOral, listBookingsForProfile } from '@/modules/exams/server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** GET ?profileId=… → the learner's orals (the learner or their teacher). */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const profileId = req.nextUrl.searchParams.get('profileId') ?? '';
  try {
    if (!(await canAccessProfile(actor, profileId))) return fail('Élève introuvable', 404);
    const bookings = await listBookingsForProfile(profileId);
    // The learner's view only: no examiner or centre identifiers
    return NextResponse.json({ bookings: bookings.map((b) => ({
      id: b.id, slotId: b.slotId, skillId: b.skillId, level: b.level, status: b.status, outcome: b.outcome,
      examinerComment: b.examinerComment, startsAt: b.startsAt, durationMin: b.durationMin,
    })) });
  } catch (err) {
    console.error('[GET /api/exam-bookings]', err);
    return fail('Erreur serveur', 500);
  }
}

/** POST { profileId, slotId, skillId } → the learner books an oral (rules checked against the database, slot taken atomically). */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const validation = validateBookingRequest(await req.json().catch(() => null));
  if (!validation.ok) return fail(validation.error, 400);
  try {
    if (!(await canAccessProfile(actor, validation.value.profileId))) return fail('Élève introuvable', 404);
    const result = await bookOral(validation.value, new Date());
    return 'bookingId' in result ? NextResponse.json(result, { status: 201 }) : fail(result.error, result.status);
  } catch (err) {
    console.error('[POST /api/exam-bookings]', err);
    return fail('Erreur serveur', 500);
  }
}
