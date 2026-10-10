/** Server-only API of the exams module (used by API routes). */
export { createSlots, listExaminerSlots, listOpenSlots, getSlot, closeFreeSlot } from './infra/slot-repository';
export { listBookingsForProfile, getBooking, liveBookingOfSlot, cancelBooking, studentOrganization } from './infra/booking-repository';
export type { BookingDetail } from './infra/booking-repository';
export { canOpenSlots, bookOral, recordOutcome } from './application/oral-service';
export { requestOral, examinerStatus, oralStaff } from './application/staffing-service';
export type { OralStaffMember } from './application/staffing-service';
export { listWaitingRequests, listRequestsOfProfile, resolveRequests, organizationOfRequest, setOralExaminer, studentNames } from './infra/staffing-repository';
export type { OralRequest } from './infra/staffing-repository';
