import {
  validateEnrollmentRequest, validateEnrollmentDecision, isEnrolled, getCourseSheet, type SkillEnrollment,
} from '@/modules/skills';

const enrollment = (status: SkillEnrollment['status'], skillId = 'logique'): SkillEnrollment => ({
  id: 'e1', profileId: 'p1', organizationId: 'org', skillId, motivation: 'm'.repeat(40), status, centerComment: null, createdAt: '2026-10-08T10:00:00Z', decidedAt: null,
});

describe('validateEnrollmentRequest', () => {
  const ok = { profileId: 'p1', skillId: 'logique', motivation: 'Je veux progresser en logique pour réussir mes concours.' };
  it('accepts a motivated request for a known skill', () => {
    expect(validateEnrollmentRequest(ok)).toEqual({ ok: true, value: ok });
  });
  it.each([
    ['huge motivation', { ...ok, motivation: 'x'.repeat(1001) }],
    ['unknown skill', { ...ok, skillId: 'nope' }],
    ['no profile', { ...ok, profileId: '' }],
    ['not an object', 'x'],
  ])('rejects %s', (_label, input) => {
    expect(validateEnrollmentRequest(input).ok).toBe(false);
  });
  it('does not require a motivation any more: it is optional', () => {
    expect(validateEnrollmentRequest({ ...ok, motivation: '' }).ok).toBe(true);
    expect(validateEnrollmentRequest({ profileId: 'p1', skillId: 'logique' })).toEqual({ ok: true, value: { profileId: 'p1', skillId: 'logique', motivation: '' } });
  });
});

describe('validateEnrollmentDecision', () => {
  it('approves with or without a comment', () => {
    expect(validateEnrollmentDecision({ status: 'approved' })).toEqual({ ok: true, value: { status: 'approved', comment: '' } });
  });
  it('requires a reason to refuse', () => {
    expect(validateEnrollmentDecision({ status: 'rejected', comment: '  ' }).ok).toBe(false);
    expect(validateEnrollmentDecision({ status: 'rejected', comment: 'Pas de place ce trimestre' }).ok).toBe(true);
  });
  it('rejects other statuses', () => {
    expect(validateEnrollmentDecision({ status: 'pending' }).ok).toBe(false);
  });
});

describe('isEnrolled', () => {
  it('needs an approved enrollment: a level reached by quizzes does not open the complete training', () => {
    expect(isEnrolled('logique', [])).toBe(false);
    expect(isEnrolled('logique', [enrollment('pending')])).toBe(false);
    expect(isEnrolled('logique', [enrollment('rejected')])).toBe(false);
    expect(isEnrolled('logique', [enrollment('approved')])).toBe(true);
    expect(isEnrolled('logique', [enrollment('approved', 'methode')])).toBe(false);
  });
});

describe('getCourseSheet', () => {
  it('describes the course: levels, activities and expected effort', () => {
    const sheet = getCourseSheet('maths-fractions');
    expect(sheet?.levels).toHaveLength(5);
    expect(sheet?.activities).toEqual(['quiz', 'flashcards', 'evaluation']);
    expect(sheet?.minutesToMaster).toBeGreaterThan(0);
  });
  it('offers only the evaluation when there is no question bank', () => {
    expect(getCourseSheet('logique')?.activities).toEqual(['evaluation']);
  });
  it('is undefined for an unknown skill', () => {
    expect(getCourseSheet('nope')).toBeUndefined();
  });
});
