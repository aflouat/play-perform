import { getServerClient } from '@/lib/db/client';
import type { SkillLevelNumber } from '@/modules/skills';
import type { AgendaSlot, ExamSlot } from '../domain/types';
import type { BookingStatus, Outcome, SlotStatus } from '../domain/slots';

/** Server-side only (service role): the examiners' slots. */
interface SlotRow { id: string; organization_id: string; examiner_user_id: string; starts_at: string; duration_min: number; status: SlotStatus }
interface BookingEmbed { id: string; profile_id: string; skill_id: string; level: number; status: BookingStatus; outcome: Outcome | null }

const slots = () => getServerClient().from('exam_slots');
export const toSlot = (r: SlotRow): ExamSlot => ({
  id: r.id, organizationId: r.organization_id, examinerUserId: r.examiner_user_id, startsAt: new Date(r.starts_at).toISOString(), durationMin: r.duration_min, status: r.status,
});

/** Opens the slots that do not exist yet for this examiner (same start time = skipped). */
export async function createSlots(examinerUserId: string, organizationId: string, durationMin: number, starts: string[]): Promise<{ created: number; skipped: number }> {
  const { data: existing, error: readError } = await slots().select('starts_at').eq('examiner_user_id', examinerUserId).neq('status', 'cancelled')
    .gte('starts_at', starts[0]).lte('starts_at', starts[starts.length - 1]);
  if (readError) throw new Error(readError.message);
  const taken = new Set(((existing ?? []) as { starts_at: string }[]).map((r) => new Date(r.starts_at).toISOString()));
  const fresh = starts.filter((s) => !taken.has(s));
  if (fresh.length > 0) {
    const { error } = await slots().insert(fresh.map((s) => ({ examiner_user_id: examinerUserId, organization_id: organizationId, starts_at: s, duration_min: durationMin })));
    if (error) throw new Error(error.message);
  }
  return { created: fresh.length, skipped: starts.length - fresh.length };
}

/** The examiner's slots between two instants, with the learner of each booked slot. */
export async function listExaminerSlots(examinerUserId: string, from: string, to: string): Promise<AgendaSlot[]> {
  const { data, error } = await slots().select('*, exam_bookings(id, profile_id, skill_id, level, status, outcome)')
    .eq('examiner_user_id', examinerUserId).neq('status', 'cancelled').gte('starts_at', from).lt('starts_at', to).order('starts_at');
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as (SlotRow & { exam_bookings: BookingEmbed[] })[];
  const live = (r: (typeof rows)[number]) => r.exam_bookings.find((b) => b.status !== 'cancelled') ?? null;
  const ids = rows.map(live).filter((b): b is BookingEmbed => b !== null).map((b) => b.profile_id);
  const { data: students } = ids.length ? await getServerClient().from('students').select('id, name, last_name').in('id', ids) : { data: [] };
  const names = new Map(((students ?? []) as { id: string; name: string; last_name: string | null }[]).map((s) => [s.id, [s.name, s.last_name].filter(Boolean).join(' ')]));
  return rows.map((r) => {
    const b = live(r);
    return { ...toSlot(r), booking: b && { id: b.id, profileId: b.profile_id, studentName: names.get(b.profile_id) ?? 'Élève', skillId: b.skill_id, level: b.level as SkillLevelNumber, status: b.status, outcome: b.outcome } };
  });
}

/** Free slots of a centre from an instant on (what a learner may book). */
export async function listOpenSlots(organizationId: string, from: string, to: string): Promise<ExamSlot[]> {
  const { data, error } = await slots().select('*').eq('organization_id', organizationId).eq('status', 'available').gte('starts_at', from).lt('starts_at', to).order('starts_at');
  if (error) throw new Error(error.message);
  return ((data ?? []) as SlotRow[]).map(toSlot);
}

export async function getSlot(id: string): Promise<ExamSlot | null> {
  const { data, error } = await slots().select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? toSlot(data as SlotRow) : null;
}

/** Closes a free slot (a booked one is cancelled through its booking). */
export async function closeFreeSlot(id: string): Promise<boolean> {
  const { data, error } = await slots().update({ status: 'cancelled' }).eq('id', id).eq('status', 'available').select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}
