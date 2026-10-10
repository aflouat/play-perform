/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST as openSlots } from '@/app/api/exam-slots/route';
import { DELETE as closeSlot } from '@/app/api/exam-slots/[id]/route';
import { POST as book } from '@/app/api/exam-bookings/route';
import { DELETE as cancel, PATCH as outcome } from '@/app/api/exam-bookings/[id]/route';
import * as actorAuth from '@/lib/actor-auth';
import * as accessContext from '@/lib/access-context';
import * as server from '@/modules/exams/server';
import * as competition from '@/modules/competition/server';
import type { BookingDetail } from '@/modules/exams/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/lib/access-context');
jest.mock('@/modules/competition/server');
jest.mock('@/modules/exams/server', () => ({ ...jest.requireActual('@/modules/exams/application/oral-service'), ...jestMocks() }));
function jestMocks() {
  return {
    createSlots: jest.fn(), getSlot: jest.fn(), closeFreeSlot: jest.fn(), liveBookingOfSlot: jest.fn(), cancelBooking: jest.fn(),
    getBooking: jest.fn(), bookOral: jest.fn(), recordOutcome: jest.fn(), listBookingsForProfile: jest.fn(),
  };
}

const repo = jest.mocked(server);
const req = (method: string, body?: unknown) => new NextRequest('http://x/api', { method, body: body ? JSON.stringify(body) : undefined });
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const examiner = { userId: 'u-exam', email: 'e@x', isSuperAdmin: false, memberships: [{ organizationId: 'org-1', role: 'examiner' as const }] };
const inDays = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const booking = (patch: Partial<BookingDetail> = {}): BookingDetail => ({
  id: 'b1', slotId: 's1', skillId: 'logique', level: 2, status: 'booked', outcome: null, examinerComment: null, startsAt: inDays(3), durationMin: 30,
  profileId: 'p1', organizationId: 'org-1', examinerUserId: 'u-exam', ...patch,
});

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(accessContext.getAccessContext).mockResolvedValue(examiner);
  jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  jest.mocked(actorAuth.canAccessProfile).mockResolvedValue(true);
});

describe('examiner slots', () => {
  const range = (org: string) => ({ organizationId: org, from: inDays(2), to: new Date(Date.parse(inDays(2)) + 3_600_000).toISOString() });

  it('opens 30-minute slots in a centre where the caller is an examiner only', async () => {
    repo.createSlots.mockResolvedValue({ created: 2, skipped: 0 });
    expect((await openSlots(req('POST', range('org-1')))).status).toBe(201);
    expect(repo.createSlots).toHaveBeenCalledWith('u-exam', 'org-1', 30, expect.any(Array));
    expect(repo.createSlots.mock.calls[0][3]).toHaveLength(2);
    expect((await openSlots(req('POST', range('org-2')))).status).toBe(403);
  });

  it('closes a free slot; a booked one is cancelled for the learner; someone else’s slot is not found', async () => {
    repo.getSlot.mockResolvedValue({ id: 's1', organizationId: 'org-1', examinerUserId: 'u-exam', startsAt: inDays(1), durationMin: 30, status: 'available' });
    repo.closeFreeSlot.mockResolvedValue(true);
    expect((await closeSlot(req('DELETE'), params('s1'))).status).toBe(200);
    repo.getSlot.mockResolvedValue({ id: 's1', organizationId: 'org-1', examinerUserId: 'u-exam', startsAt: inDays(1), durationMin: 30, status: 'booked' });
    repo.liveBookingOfSlot.mockResolvedValue('b1');
    repo.cancelBooking.mockResolvedValue(true);
    expect((await closeSlot(req('DELETE'), params('s1'))).status).toBe(200);
    expect(repo.cancelBooking).toHaveBeenCalledWith('b1', 'examiner');
    repo.getSlot.mockResolvedValue({ id: 's1', organizationId: 'org-1', examinerUserId: 'other', startsAt: inDays(1), durationMin: 30, status: 'available' });
    expect((await closeSlot(req('DELETE'), params('s1'))).status).toBe(404);
  });
});

describe('learner bookings', () => {
  it('books through the service and relays its refusal', async () => {
    repo.bookOral.mockResolvedValue({ bookingId: 'b1' });
    expect((await book(req('POST', { profileId: 'p1', slotId: 's1', skillId: 'logique' }))).status).toBe(201);
    repo.bookOral.mockResolvedValue({ status: 409, error: 'Ce créneau n’est plus disponible' });
    const refused = await book(req('POST', { profileId: 'p1', slotId: 's1', skillId: 'logique' }));
    expect(refused.status).toBe(409);
    jest.mocked(actorAuth.canAccessProfile).mockResolvedValue(false);
    expect((await book(req('POST', { profileId: 'p2', slotId: 's1', skillId: 'logique' }))).status).toBe(404);
  });

  it('cancels up to 24 h before only', async () => {
    repo.getBooking.mockResolvedValue(booking());
    repo.cancelBooking.mockResolvedValue(true);
    expect((await cancel(req('DELETE'), params('b1'))).status).toBe(200);
    expect(repo.cancelBooking).toHaveBeenCalledWith('b1', 'learner');
    repo.getBooking.mockResolvedValue(booking({ startsAt: new Date(Date.now() + 3_600_000).toISOString() }));
    expect((await cancel(req('DELETE'), params('b1'))).status).toBe(409);
  });
});

describe('result of the oral', () => {
  it('is recorded by the slot’s examiner once started; a pass feeds the activity feed', async () => {
    repo.getBooking.mockResolvedValue(booking({ startsAt: inDays(-0.01) }));
    repo.recordOutcome.mockResolvedValue({ newLevel: 3 });
    const res = await outcome(req('PATCH', { outcome: 'passed', comment: 'Bien argumenté' }), params('b1'));
    expect(res.status).toBe(200);
    expect(repo.recordOutcome).toHaveBeenCalledWith(expect.objectContaining({ id: 'b1' }), 'passed', 'Bien argumenté');
    expect(competition.recordMilestone).toHaveBeenCalledWith('p1', 'logique', 3);
  });

  it('is refused before the oral, to another examiner, and twice', async () => {
    repo.getBooking.mockResolvedValue(booking());
    expect((await outcome(req('PATCH', { outcome: 'passed' }), params('b1'))).status).toBe(400);
    repo.getBooking.mockResolvedValue(booking({ startsAt: inDays(-0.01), examinerUserId: 'other' }));
    expect((await outcome(req('PATCH', { outcome: 'passed' }), params('b1'))).status).toBe(404);
    repo.getBooking.mockResolvedValue(booking({ startsAt: inDays(-0.01), status: 'done' }));
    expect((await outcome(req('PATCH', { outcome: 'passed' }), params('b1'))).status).toBe(409);
  });
});
