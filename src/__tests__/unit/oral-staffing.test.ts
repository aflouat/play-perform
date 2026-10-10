import {
  FINAL_ORAL_LEVEL, examinerNotice, isFinalOralPhase, oralRequestRefusal, validateOralGrant,
} from '@/modules/exams/domain/staffing';

describe('who may give orals (set by the centre)', () => {
  const members = [
    { userId: 'u-teacher', role: 'teacher' as const }, { userId: 'u-exam', role: 'examiner' as const }, { userId: 'u-boss', role: 'org_admin' as const },
  ];

  it('the centre enables or disables a teacher or an examiner of the centre', () => {
    expect(validateOralGrant({ organizationId: 'org-1', userId: 'u-teacher', enabled: true }, members))
      .toEqual({ ok: true, value: { organizationId: 'org-1', userId: 'u-teacher', enabled: true } });
    expect(validateOralGrant({ organizationId: 'org-1', userId: 'u-exam', enabled: false }, members)).toMatchObject({ ok: true });
  });

  it('refuses someone outside the centre, a manager only, or a malformed request', () => {
    expect(validateOralGrant({ organizationId: 'org-1', userId: 'stranger', enabled: true }, members)).toMatchObject({ ok: false, error: expect.stringMatching(/enseignants et examinateurs/) });
    expect(validateOralGrant({ organizationId: 'org-1', userId: 'u-boss', enabled: true }, members).ok).toBe(false);
    expect(validateOralGrant({ organizationId: 'org-1', userId: 'u-teacher' }, members).ok).toBe(false);
  });
});

describe('final oral phase', () => {
  it('starts at the level the diploma requires', () => {
    expect(FINAL_ORAL_LEVEL).toBe(4);
    expect(isFinalOralPhase(3)).toBe(false);
    expect(isFinalOralPhase(4)).toBe(true);
    expect(isFinalOralPhase(5)).toBe(true);
    expect(isFinalOralPhase(null)).toBe(false);
  });
});

describe('waiting list when no examiner is available', () => {
  const ctx = { enrolled: true, level: 4 as const, openSlots: 0, upcomingForSkill: 0, waiting: false };

  it('puts a learner of the final phase on the waiting list when the centre has no free slot', () => {
    expect(oralRequestRefusal(ctx)).toBeNull();
  });

  it.each([
    ['a learner not enrolled', { enrolled: false }, 403],
    ['a learner before the final phase', { level: 3 as const }, 409],
    ['free slots exist: book one instead', { openSlots: 2 }, 409],
    ['an oral already booked', { upcomingForSkill: 1 }, 409],
  ])('refuses %s', (_label, patch, status) => {
    expect(oralRequestRefusal({ ...ctx, ...patch })).toMatchObject({ status });
  });

  it('is idempotent: an existing waiting request is simply kept', () => {
    expect(oralRequestRefusal({ ...ctx, waiting: true })).toEqual({ status: 200, error: 'Tu es déjà sur la liste d’attente.' });
  });
});

describe('notice shown to an examiner allowed to give orals', () => {
  it('asks for availabilities when they have none, and stresses the learners waiting', () => {
    expect(examinerNotice({ centres: 1, openSlots: 0, waiting: 0 })).toEqual({ tone: 'info', text: expect.stringMatching(/saisis tes disponibilités/) });
    expect(examinerNotice({ centres: 1, openSlots: 3, waiting: 2 })).toEqual({ tone: 'urgent', text: expect.stringMatching(/2 élèves attendent/) });
    expect(examinerNotice({ centres: 1, openSlots: 3, waiting: 0 })).toBeNull();
    expect(examinerNotice({ centres: 0, openSlots: 0, waiting: 5 })).toBeNull();
  });
});
