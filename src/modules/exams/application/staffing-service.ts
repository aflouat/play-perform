import { isEnrolled, listEnrollmentsForProfile, listLevels } from '@/modules/skills/server';
import { listMembers } from '@/modules/organizations/server';
import type { OrgRole } from '@/modules/organizations';
import { MIN_NOTICE_HOURS } from '../domain/slots';
import { oralRequestRefusal } from '../domain/staffing';
import { listOpenSlots } from '../infra/slot-repository';
import { listBookingsForProfile, studentOrganization } from '../infra/booking-repository';
import {
  centreNames, createRequest, listRequestsOfProfile, listWaitingRequests, openSlotCounts, oralCentresOf, oralExaminersOf,
} from '../infra/staffing-repository';

/** Server-side only. */
const HOUR_MS = 60 * 60 * 1000;
const bookableWindow = () => ({ from: new Date(Date.now() + MIN_NOTICE_HOURS * HOUR_MS).toISOString(), to: new Date(Date.now() + 30 * 24 * HOUR_MS).toISOString() });

/** No free slot for a learner of the final phase: they join the waiting list and the centre has to find an examiner. */
export async function requestOral(profileId: string, skillId: string): Promise<{ status: number; error?: string }> {
  const organizationId = await studentOrganization(profileId);
  if (!organizationId) return { status: 404, error: 'Élève introuvable' };
  const { from, to } = bookableWindow();
  const [enrollments, levels, slots, bookings, requests] = await Promise.all([
    listEnrollmentsForProfile(profileId), listLevels(profileId), listOpenSlots(organizationId, from, to),
    listBookingsForProfile(profileId), listRequestsOfProfile(profileId),
  ]);
  const level = levels[skillId] ?? null;
  const refusal = oralRequestRefusal({
    enrolled: isEnrolled(skillId, enrollments), level, openSlots: slots.length,
    upcomingForSkill: bookings.filter((b) => b.skillId === skillId && b.status === 'booked' && new Date(b.startsAt).getTime() > Date.now()).length,
    waiting: requests.some((r) => r.skillId === skillId && r.status === 'waiting'),
  });
  if (refusal) return refusal;
  await createRequest(profileId, organizationId, skillId, level ?? 4);
  return { status: 201 };
}

/** What the notice of someone allowed to give orals needs: their centres, their free slots, the learners waiting there. */
export async function examinerStatus(userId: string): Promise<{ centres: { id: string; name: string }[]; openSlots: number; waiting: number }> {
  const ids = await oralCentresOf(userId);
  if (ids.length === 0) return { centres: [], openSlots: 0, waiting: 0 };
  const [centres, counts, waiting] = await Promise.all([centreNames(ids), openSlotCounts({ examinerUserId: userId }), listWaitingRequests(ids)]);
  return { centres, openSlots: counts.get(userId) ?? 0, waiting: waiting.length };
}

export interface OralStaffMember { userId: string; email: string; roles: OrgRole[]; canOral: boolean; openSlots: number }

/** The centre's teachers and examiners, whether they may give orals, and their free slots. */
export async function oralStaff(organizationId: string): Promise<OralStaffMember[]> {
  const [members, enabled, counts] = await Promise.all([listMembers(organizationId), oralExaminersOf(organizationId), openSlotCounts({ organizationId })]);
  const byUser = new Map<string, OralStaffMember>();
  for (const m of members.filter((x) => x.role === 'teacher' || x.role === 'examiner')) {
    const current = byUser.get(m.userId) ?? { userId: m.userId, email: m.email, roles: [], canOral: enabled.includes(m.userId), openSlots: counts.get(m.userId) ?? 0 };
    byUser.set(m.userId, { ...current, roles: [...current.roles, m.role] });
  }
  return [...byUser.values()];
}
