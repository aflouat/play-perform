import {
  DEFAULT_SLOT_MINUTES, bookingRefusal, cancelRefusal, groupByDay, splitAvailability, validateAvailability, validateBookingRequest, validateOutcome,
} from '@/modules/exams/domain/slots';

const NOW = new Date('2026-10-12T08:00:00Z');
const at = (iso: string) => new Date(iso);

describe('availability → slots', () => {
  it('cuts a range into 30-minute slots by default, the last one ending within the range', () => {
    expect(DEFAULT_SLOT_MINUTES).toBe(30);
    expect(splitAvailability(at('2026-10-14T09:00:00Z'), at('2026-10-14T10:45:00Z'))).toEqual([
      '2026-10-14T09:00:00.000Z', '2026-10-14T09:30:00.000Z', '2026-10-14T10:00:00.000Z',
    ]);
    expect(splitAvailability(at('2026-10-14T09:00:00Z'), at('2026-10-14T10:00:00Z'), 60)).toEqual(['2026-10-14T09:00:00.000Z']);
  });

  it('validates the request of an examiner', () => {
    const ok = validateAvailability({ organizationId: 'org-1', from: '2026-10-14T09:00:00Z', to: '2026-10-14T11:00:00Z' }, NOW);
    expect(ok).toEqual({ ok: true, value: { organizationId: 'org-1', durationMin: 30, starts: [
      '2026-10-14T09:00:00.000Z', '2026-10-14T09:30:00.000Z', '2026-10-14T10:00:00.000Z', '2026-10-14T10:30:00.000Z'] } });
  });

  it.each([
    ['a past range', { from: '2026-10-11T09:00:00Z', to: '2026-10-11T10:00:00Z' }, /passé/],
    ['an end before the start', { from: '2026-10-14T11:00:00Z', to: '2026-10-14T09:00:00Z' }, /après/],
    ['a range shorter than one slot', { from: '2026-10-14T09:00:00Z', to: '2026-10-14T09:20:00Z' }, /au moins un créneau/],
    ['a range over 12 hours', { from: '2026-10-14T06:00:00Z', to: '2026-10-14T19:00:00Z' }, /12 h/],
    ['a date more than 90 days ahead', { from: '2027-02-14T09:00:00Z', to: '2027-02-14T10:00:00Z' }, /90 jours/],
    ['an unknown duration', { from: '2026-10-14T09:00:00Z', to: '2026-10-14T10:00:00Z', durationMin: 20 }, /durée/i],
    ['no centre', { organizationId: '', from: '2026-10-14T09:00:00Z', to: '2026-10-14T10:00:00Z' }, /centre/i],
  ])('refuses %s', (_label, patch, error) => {
    const result = validateAvailability({ organizationId: 'org-1', ...patch }, NOW);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(error);
  });
});

describe('booking an oral', () => {
  const slot = { status: 'available' as const, startsAt: '2026-10-14T09:00:00Z', organizationId: 'org-1' };
  const ctx = { slot, studentOrganizationId: 'org-1', enrolled: true, upcomingForSkill: 0, upcomingTotal: 0 };

  it('accepts a free slot of the learner’s centre, in a skill they are enrolled in', () => {
    expect(bookingRefusal(ctx, NOW)).toBeNull();
  });

  it.each([
    ['a slot already taken', { slot: { ...slot, status: 'booked' as const } }, 409, /plus disponible/],
    ['a slot of another centre', { studentOrganizationId: 'org-2' }, 403, /ton centre/],
    ['a skill without enrollment', { enrolled: false }, 403, /inscri/],
    ['a slot starting in less than 2 h', { slot: { ...slot, startsAt: '2026-10-12T09:30:00Z' } }, 409, /2 h/],
    ['a second oral in the same skill', { upcomingForSkill: 1 }, 409, /déjà un oral/],
    ['a fourth oral', { upcomingTotal: 3 }, 409, /3 oraux/],
  ])('refuses %s', (_label, patch, status, error) => {
    expect(bookingRefusal({ ...ctx, ...patch }, NOW)).toEqual({ status, error: expect.stringMatching(error) });
  });

  it('validates the body', () => {
    expect(validateBookingRequest({ profileId: 'p1', slotId: 's1', skillId: 'logique' })).toEqual({ ok: true, value: { profileId: 'p1', slotId: 's1', skillId: 'logique' } });
    expect(validateBookingRequest({ profileId: 'p1', slotId: '', skillId: 'logique' }).ok).toBe(false);
    expect(validateBookingRequest({ profileId: 'p1', slotId: 's1', skillId: 'astronautique' }).ok).toBe(false);
  });
});

describe('cancelling', () => {
  const booking = { status: 'booked' as const, startsAt: '2026-10-14T09:00:00Z' };
  it('the learner cancels up to 24 h before, the examiner until the start', () => {
    expect(cancelRefusal(booking, 'learner', NOW)).toBeNull();
    expect(cancelRefusal(booking, 'learner', at('2026-10-13T10:00:00Z'))).toMatch(/24 h/);
    expect(cancelRefusal(booking, 'examiner', at('2026-10-14T08:59:00Z'))).toBeNull();
    expect(cancelRefusal(booking, 'examiner', at('2026-10-14T09:01:00Z'))).toMatch(/commencé/);
    expect(cancelRefusal({ ...booking, status: 'cancelled' }, 'learner', NOW)).toMatch(/déjà annulé/);
  });
});

describe('outcome of the oral', () => {
  it('passed, failed (with an explanation) or absent, once the oral has started', () => {
    const started = at('2026-10-14T09:10:00Z');
    expect(validateOutcome({ outcome: 'passed', comment: 'Très clair' }, '2026-10-14T09:00:00Z', started))
      .toEqual({ ok: true, value: { outcome: 'passed', comment: 'Très clair' } });
    expect(validateOutcome({ outcome: 'failed', comment: '' }, '2026-10-14T09:00:00Z', started).ok).toBe(false);
    expect(validateOutcome({ outcome: 'no_show' }, '2026-10-14T09:00:00Z', started)).toEqual({ ok: true, value: { outcome: 'no_show', comment: '' } });
    expect(validateOutcome({ outcome: 'passed' }, '2026-10-14T09:00:00Z', at('2026-10-14T08:00:00Z'))).toMatchObject({ ok: false, error: expect.stringMatching(/pas encore commencé/) });
  });
});

describe('agenda display', () => {
  it('groups slots by local day, in order', () => {
    const days = groupByDay([{ startsAt: '2026-10-15T08:00:00Z' }, { startsAt: '2026-10-14T09:30:00Z' }, { startsAt: '2026-10-14T09:00:00Z' }], 'Europe/Paris');
    expect(days.map((d) => [d.day, d.slots.map((s) => s.startsAt)])).toEqual([
      ['2026-10-14', ['2026-10-14T09:00:00Z', '2026-10-14T09:30:00Z']],
      ['2026-10-15', ['2026-10-15T08:00:00Z']],
    ]);
  });
});
