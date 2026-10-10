import { NextRequest, NextResponse } from 'next/server';
import { getAccessContext } from '@/lib/access-context';
import { cancelRefusal } from '@/modules/exams';
import { cancelBooking, closeFreeSlot, getSlot, liveBookingOfSlot } from '@/modules/exams/server';

type Params = { params: Promise<{ id: string }> };
const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** DELETE → the examiner closes one of their slots; a booked one is cancelled for the learner (until the oral starts). */
export async function DELETE(req: NextRequest, { params }: Params): Promise<NextResponse> {
  const ctx = await getAccessContext(req);
  if (!ctx) return fail('Non autorisé', 403);
  const { id } = await params;
  try {
    const slot = await getSlot(id);
    if (!slot || slot.examinerUserId !== ctx.userId) return fail('Créneau introuvable', 404);
    if (slot.status === 'available') return (await closeFreeSlot(id)) ? NextResponse.json({ ok: true }) : fail('Ce créneau vient d’être réservé.', 409);
    const bookingId = slot.status === 'booked' ? await liveBookingOfSlot(id) : null;
    if (!bookingId) return fail('Ce créneau est déjà fermé.', 409);
    const refusal = cancelRefusal({ status: 'booked', startsAt: slot.startsAt }, 'examiner', new Date());
    if (refusal) return fail(refusal, 409);
    return (await cancelBooking(bookingId, 'examiner')) ? NextResponse.json({ ok: true, cancelledBooking: bookingId }) : fail('Déjà annulé.', 409);
  } catch (err) {
    console.error('[DELETE /api/exam-slots/:id]', err);
    return fail('Erreur serveur', 500);
  }
}
