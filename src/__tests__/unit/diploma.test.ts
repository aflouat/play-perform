import { diplomaEligibility, diplomaReference, type SkillEvaluation } from '@/modules/skills';

const evaluation = (level: SkillEvaluation['level'], status: SkillEvaluation['status']): SkillEvaluation => ({
  id: `e${level}${status}`, profileId: 'p1', organizationId: 'o', skillId: 'logique', level, prompt: 'p', answer: 'a', status,
  examinerComment: null, createdAt: '2026-10-01T10:00:00Z', correctedAt: status === 'pending' ? null : '2026-10-05T10:00:00Z',
});
const base = { level: 5 as const, enrolled: true, evaluations: [evaluation(4, 'passed')], hasNames: true };

describe('diplomaEligibility', () => {
  it('is granted for the complete training: enrolled, level 5 reached, a high-level evaluation passed, names filled', () => {
    expect(diplomaEligibility(base)).toEqual({ eligible: true, missing: [], issuedOn: '2026-10-05' });
  });

  it('lists what is missing, in the order the learner should do it', () => {
    const result = diplomaEligibility({ level: 3, enrolled: false, evaluations: [], hasNames: false });
    expect(result.eligible).toBe(false);
    expect(result.missing).toEqual(['enrollment', 'level', 'evaluation', 'names']);
  });

  it('needs an examiner-validated evaluation of level 4 or above: quizzes alone are not enough', () => {
    expect(diplomaEligibility({ ...base, evaluations: [] }).missing).toEqual(['evaluation']);
    expect(diplomaEligibility({ ...base, evaluations: [evaluation(2, 'passed')] }).missing).toEqual(['evaluation']);
    expect(diplomaEligibility({ ...base, evaluations: [evaluation(4, 'pending'), evaluation(4, 'failed')] }).missing).toEqual(['evaluation']);
    expect(diplomaEligibility({ ...base, evaluations: [evaluation(5, 'passed')] }).eligible).toBe(true);
  });

  it('needs the names for printing, and level 5', () => {
    expect(diplomaEligibility({ ...base, hasNames: false }).missing).toEqual(['names']);
    expect(diplomaEligibility({ ...base, level: 4 }).missing).toEqual(['level']);
    expect(diplomaEligibility({ ...base, level: null }).missing).toEqual(['level']);
  });

  it('dates the diploma by the latest validation', () => {
    const later = { ...evaluation(5, 'passed'), correctedAt: '2026-10-09T08:00:00Z' };
    expect(diplomaEligibility({ ...base, evaluations: [evaluation(4, 'passed'), later] }).issuedOn).toBe('2026-10-09');
  });
});

describe('diplomaReference', () => {
  it('is stable for a learner, a skill and a date, and differs otherwise', () => {
    const a = diplomaReference('p1', 'logique', '2026-10-05');
    expect(a).toMatch(/^PP-[0-9A-F]{8}$/);
    expect(diplomaReference('p1', 'logique', '2026-10-05')).toBe(a);
    expect(diplomaReference('p2', 'logique', '2026-10-05')).not.toBe(a);
    expect(diplomaReference('p1', 'methode', '2026-10-05')).not.toBe(a);
  });
});
