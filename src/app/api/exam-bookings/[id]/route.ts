import { NextRequest, NextResponse } from 'next/server';
import { canAccessProfile, getActorFromRequest } from '@/lib/actor-auth';
import { getAccessContext } from '@/lib/access-context';
import { cancelRefusal, validateOutcome } from '@/modules/exams';
import { cancelBooking, getBooking, recordOutcome } from '@/modules/exams/server';
import { recordMilestone } from '@/modules/competition/server';

type Params = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** DELETE → the learner (or their teacher) cancels an oral, up to 24 h before: the slot is offered again. */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const actor = await getActorFromRequest(req);
  if (!actor) return fail('Non autorisé', 401);
  const { id } = await params;
  try {
    const booking = await getBooking(id);
    if (!booking || !(await canAccessProfile(actor, booking.profileId))) return fail('Oral introuvable', 404);
    const refusal = cancelRefusal(booking, 'learner', new Date());
    if (refusal) return fail(refusal, 409);
    return (await cancelBooking(id, 'learner')) ? NextResponse.json({ ok: true }) : fail('Déjà annulé.', 409);
  } catch (err) {
    console.error('[DELETE /api/exam-bookings/:id]', err);
    return fail('Erreur serveur', 500);
  }
}

/** PATCH { outcome, comment } → the examiner of the slot records the result once the oral has started. */
export async function PATCH(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return fail('Non autorisé', 403);
  const { id } = await params;
  try {
    const booking = await getBooking(id);
    if (!booking || booking.examinerUserId !== ctx.userId) return fail('Oral introuvable', 404);
    if (booking.status !== 'booked') return fail('Le résultat de cet oral est déjà saisi, ou l’oral est annulé.', 409);
    const validation = validateOutcome(await req.json().catch(() => null), booking.startsAt, new Date());
    if (!validation.ok) return fail(validation.error, 400);
    const result = await recordOutcome(booking, validation.value.outcome, validation.value.comment);
    if (!result) return fail('Le résultat de cet oral est déjà saisi.', 409);
    if (result.newLevel) await recordMilestone(booking.profileId, booking.skillId, result.newLevel);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[PATCH /api/exam-bookings/:id]', err);
    return fail('Erreur serveur', 500);
  }
}
