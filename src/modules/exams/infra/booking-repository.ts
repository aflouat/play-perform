import { getServerClient } from '@/lib/db/client';
import type { SkillLevelNumber } from '@/modules/skills';
import type { LearnerBooking } from '../domain/types';
import type { BookingStatus, Outcome } from '../domain/slots';

/** Server-side only (service role): the learners' bookings. */
interface Row {
  id: string; slot_id: string; profile_id: string; organization_id: string; skill_id: string; level: number; status: BookingStatus; outcome: Outcome | null;
  examiner_comment: string | null; exam_slots: { starts_at: string; duration_min: number; examiner_user_id: string };
}

export interface BookingDetail extends LearnerBooking { profileId: string; organizationId: string; examinerUserId: string }

const bookings = () => getServerClient().from('exam_bookings');
const SELECT = '*, exam_slots(starts_at, duration_min, examiner_user_id)';
const toBooking = (r: Row): BookingDetail => ({
  id: r.id, slotId: r.slot_id, skillId: r.skill_id, level: r.level as SkillLevelNumber, status: r.status, outcome: r.outcome, examinerComment: r.examiner_comment,
  startsAt: new Date(r.exam_slots.starts_at).toISOString(), durationMin: r.exam_slots.duration_min,
  profileId: r.profile_id, organizationId: r.organization_id, examinerUserId: r.exam_slots.examiner_user_id,
});

export async function listBookingsForProfile(profileId: string): Promise<BookingDetail[]> {
  const { data, error } = await bookings().select(SELECT).eq('profile_id', profileId).order('created_at', { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toBooking);
}

export async function getBooking(id: string): Promise<BookingDetail | null> {
  const { data, error } = await bookings().select(SELECT).eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toBooking(data as Row) : null;
}

/** Live booking of a slot (to cancel a booked slot from the agenda). */
export async function liveBookingOfSlot(slotId: string): Promise<string | null> {
  const { data } = await bookings().select('id').eq('slot_id', slotId).eq('status', 'booked').maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/** Atomic (SQL function): null when the slot was taken in the meantime. */
export async function bookSlot(slotId: string, profileId: string, skillId: string, level: SkillLevelNumber): Promise<string | null> {
  const { data, error } = await getServerClient().rpc('book_exam_slot', { p_slot: slotId, p_profile: profileId, p_skill: skillId, p_level: level });
  if (error?.code === '23505') return null;
  if (error) throw new Error(error.message);
  return (data as string | null) ?? null;
}

/** Atomic (SQL function): a learner frees the slot, an examiner closes it. */
export async function cancelBooking(id: string, by: 'learner' | 'examiner'): Promise<boolean> {
  const { data, error } = await getServerClient().rpc('cancel_exam_booking', { p_booking: id, p_by: by });
  if (error) throw new Error(error.message);
  return data === true;
}

export async function completeBooking(id: string, outcome: Outcome, comment: string, evaluationId: string | null): Promise<boolean> {
  const { data, error } = await bookings().update({ status: 'done', outcome, examiner_comment: comment || null, evaluation_id: evaluationId, completed_at: new Date().toISOString() })
    .eq('id', id).eq('status', 'booked').select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

/** Centre of a learner (their slots are this centre's). */
export async function studentOrganization(profileId: string): Promise<string | null> {
  const { data } = await getServerClient().from('students').select('organization_id').eq('id', profileId).maybeSingle();
  return (data as { organization_id: string } | null)?.organization_id ?? null;
}
