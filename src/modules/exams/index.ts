/** Public API of the exams module: orals on time slots — examiners open slots, learners book them, examiners record the result. */
export type { SlotStatus, BookingStatus, Outcome, BookingRequest, BookingContext } from './domain/slots';
export {
  DEFAULT_SLOT_MINUTES, SLOT_DURATIONS, MIN_NOTICE_HOURS, LEARNER_CANCEL_HOURS, MAX_UPCOMING_ORALS,
  splitAvailability, validateAvailability, validateBookingRequest, bookingRefusal, cancelRefusal, validateOutcome, groupByDay, dayIn,
} from './domain/slots';
export type { ExamSlot, AgendaSlot, LearnerBooking } from './domain/types';
export { ExamAgenda } from './ui/ExamAgenda';
export { OralBooking } from './ui/OralBooking';
export { fetchMyOrals } from './infra/exam-client';
