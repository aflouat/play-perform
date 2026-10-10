/** @jest-environment node */
import { bookOral, recordOutcome } from '@/modules/exams/application/oral-service';
import * as slots from '@/modules/exams/infra/slot-repository';
import * as bookings from '@/modules/exams/infra/booking-repository';
import * as skills from '@/modules/skills/server';
import type { BookingDetail } from '@/modules/exams/infra/booking-repository';

jest.mock('@/modules/exams/infra/slot-repository');
jest.mock('@/modules/exams/infra/booking-repository');
jest.mock('@/modules/skills/server', () => ({
  ...jest.requireActual('@/modules/skills/domain/enrollment'),
  getEvaluationPrompt: () => 'Explique ton raisonnement.',
  listEnrollmentsForProfile: jest.fn(), listLevels: jest.fn(), recordOralEvaluation: jest.fn(),
}));

const NOW = new Date('2026-10-12T08:00:00Z');
const enrollment = { id: 'e1', profileId: 'p1', skillId: 'logique', status: 'approved', motivation: '', createdAt: '', decidedAt: '', comment: null, organizationId: 'org-1' };
const detail = (patch: Partial<BookingDetail> = {}): BookingDetail => ({
  id: 'b1', slotId: 's1', skillId: 'logique', level: 2, status: 'booked', outcome: null, examinerComment: null,
  startsAt: '2026-10-12T07:30:00Z', durationMin: 30, profileId: 'p1', organizationId: 'org-1', examinerUserId: 'u1', ...patch,
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(slots.getSlot).mockResolvedValue({ id: 's1', organizationId: 'org-1', examinerUserId: 'u1', startsAt: '2026-10-14T09:00:00Z', durationMin: 30, status: 'available' });
  jest.mocked(bookings.studentOrganization).mockResolvedValue('org-1');
  jest.mocked(bookings.listBookingsForProfile).mockResolvedValue([]);
  jest.mocked(skills.listEnrollmentsForProfile).mockResolvedValue([enrollment] as never);
  jest.mocked(skills.listLevels).mockResolvedValue({ logique: 2 });
  jest.mocked(bookings.bookSlot).mockResolvedValue('b1');
});

describe('bookOral', () => {
  it('books at the learner’s current level', async () => {
    expect(await bookOral({ profileId: 'p1', slotId: 's1', skillId: 'logique' }, NOW)).toEqual({ bookingId: 'b1' });
    expect(bookings.bookSlot).toHaveBeenCalledWith('s1', 'p1', 'logique', 2);
  });

  it('counts only the orals still to come', async () => {
    jest.mocked(bookings.listBookingsForProfile).mockResolvedValue([
      detail({ startsAt: '2026-10-01T09:00:00Z' }), detail({ id: 'b2', status: 'cancelled', startsAt: '2026-10-20T09:00:00Z' }),
    ]);
    expect(await bookOral({ profileId: 'p1', slotId: 's1', skillId: 'logique' }, NOW)).toEqual({ bookingId: 'b1' });
    jest.mocked(bookings.listBookingsForProfile).mockResolvedValue([detail({ startsAt: '2026-10-20T09:00:00Z' })]);
    expect(await bookOral({ profileId: 'p1', slotId: 's1', skillId: 'logique' }, NOW)).toMatchObject({ status: 409 });
  });

  it('refuses a learner not enrolled, and a slot taken in the meantime', async () => {
    jest.mocked(skills.listEnrollmentsForProfile).mockResolvedValue([]);
    expect(await bookOral({ profileId: 'p1', slotId: 's1', skillId: 'logique' }, NOW)).toMatchObject({ status: 403 });
    jest.mocked(skills.listEnrollmentsForProfile).mockResolvedValue([enrollment] as never);
    jest.mocked(bookings.bookSlot).mockResolvedValue(null);
    expect(await bookOral({ profileId: 'p1', slotId: 's1', skillId: 'logique' }, NOW)).toMatchObject({ status: 409 });
  });
});

describe('recordOutcome', () => {
  it('turns a pass into a corrected evaluation and returns the new level', async () => {
    jest.mocked(skills.recordOralEvaluation).mockResolvedValue({ id: 'ev1' } as never);
    jest.mocked(bookings.completeBooking).mockResolvedValue(true);
    expect(await recordOutcome(detail(), 'passed', 'Clair')).toEqual({ newLevel: 3 });
    expect(skills.recordOralEvaluation).toHaveBeenCalledWith(expect.objectContaining({ status: 'passed', level: 2, comment: 'Clair', prompt: expect.stringMatching(/^Oral de 30 min — Logique/) }));
    expect(bookings.completeBooking).toHaveBeenCalledWith('b1', 'passed', 'Clair', 'ev1');
  });

  it('records an absence without any evaluation', async () => {
    jest.mocked(bookings.completeBooking).mockResolvedValue(true);
    expect(await recordOutcome(detail(), 'no_show', '')).toEqual({ newLevel: null });
    expect(skills.recordOralEvaluation).not.toHaveBeenCalled();
  });
});
