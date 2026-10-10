import { getSkillById, type SkillLevelNumber } from '@/modules/skills';
import { getEvaluationPrompt, isEnrolled, listEnrollmentsForProfile, listLevels, recordOralEvaluation } from '@/modules/skills/server';
import { bookingRefusal, type BookingRequest, type Outcome } from '../domain/slots';
import { getSlot } from '../infra/slot-repository';
import { bookSlot, completeBooking, listBookingsForProfile, studentOrganization, type BookingDetail } from '../infra/booking-repository';
import { oralCentresOf, resolveRequests } from '../infra/staffing-repository';

/** Server-side only. Slots are opened by the people the centre allowed to give orals ("peut faire passer les oraux"). */
export const canOpenSlots = async (userId: string, organizationId: string): Promise<boolean> => (await oralCentresOf(userId)).includes(organizationId);

const formatDay = (iso: string) => new Date(iso).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' });

/** Books an oral for a learner: every rule is checked against the database, the slot is taken atomically. */
export async function bookOral(request: BookingRequest, now: Date): Promise<{ bookingId: string } | { status: number; error: string }> {
  const [slot, organizationId, enrollments, bookings, levels] = await Promise.all([
    getSlot(request.slotId), studentOrganization(request.profileId), listEnrollmentsForProfile(request.profileId),
    listBookingsForProfile(request.profileId), listLevels(request.profileId),
  ]);
  if (!slot || !organizationId) return { status: 404, error: 'Créneau introuvable.' };
  const upcoming = bookings.filter((b) => b.status === 'booked' && new Date(b.startsAt) > now);
  const refusal = bookingRefusal({
    slot, studentOrganizationId: organizationId, enrolled: isEnrolled(request.skillId, enrollments),
    upcomingForSkill: upcoming.filter((b) => b.skillId === request.skillId).length, upcomingTotal: upcoming.length,
  }, now);
  if (refusal) return refusal;
  const level = (levels[request.skillId] ?? 1) as SkillLevelNumber;
  const bookingId = await bookSlot(slot.id, request.profileId, request.skillId, level);
  if (!bookingId) return { status: 409, error: 'Ce créneau vient d’être réservé par quelqu’un d’autre : choisis-en un autre.' };
  // A learner on the waiting list for this skill is now served
  await resolveRequests({ profileId: request.profileId, skillId: request.skillId }, 'booked');
  return { bookingId };
}

/** The examiner's result: a pass or a fail becomes a corrected evaluation (a pass raises the level); an absence just closes the oral. */
export async function recordOutcome(booking: BookingDetail, outcome: Outcome, comment: string): Promise<{ newLevel: number | null } | null> {
  let evaluationId: string | null = null;
  if (outcome !== 'no_show') {
    const evaluation = await recordOralEvaluation({
      profileId: booking.profileId, organizationId: booking.organizationId, skillId: booking.skillId, level: booking.level,
      prompt: `Oral de ${booking.durationMin} min — ${getSkillById(booking.skillId)?.name ?? booking.skillId}, niveau ${booking.level} : ${getEvaluationPrompt(booking.skillId, booking.level)}`,
      answer: `Évaluation orale du ${formatDay(booking.startsAt)} avec un examinateur.`,
      status: outcome, comment,
    });
    evaluationId = evaluation.id;
  }
  if (!(await completeBooking(booking.id, outcome, comment, evaluationId))) return null;
  return { newLevel: outcome === 'passed' ? Math.min(5, booking.level + 1) : null };
}
