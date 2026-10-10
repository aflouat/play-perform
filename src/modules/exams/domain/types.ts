import type { SkillLevelNumber } from '@/modules/skills';
import type { BookingStatus, Outcome, SlotStatus } from './slots';

/** A slot opened by an examiner in one centre. */
export interface ExamSlot { id: string; organizationId: string; examinerUserId: string; startsAt: string; durationMin: number; status: SlotStatus }

/** What the examiner sees in their agenda: the slot and, when booked, who comes for which skill. */
export interface AgendaSlot extends ExamSlot {
  booking: { id: string; profileId: string; studentName: string; skillId: string; level: SkillLevelNumber; status: BookingStatus; outcome: Outcome | null } | null;
}

/** An oral booked by a learner. */
export interface LearnerBooking {
  id: string; slotId: string; skillId: string; level: SkillLevelNumber; status: BookingStatus; outcome: Outcome | null;
  examinerComment: string | null; startsAt: string; durationMin: number;
}
