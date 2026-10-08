import {
  validateSubmission, validateCorrection, getEvaluationPrompt, levelAfterEvaluations, getSkills, SKILL_LEVELS,
  type SkillEvaluation,
} from '@/modules/skills';

const evalOf = (level: 1 | 2 | 3 | 4 | 5, status: SkillEvaluation['status']): SkillEvaluation => ({
  id: `e${level}${status}`, profileId: 'p1', organizationId: 'org', skillId: 'logique', level, prompt: 'p', answer: 'a', status,
  examinerComment: null, createdAt: '2026-10-08T10:00:00Z', correctedAt: null,
});

describe('evaluation prompts', () => {
  it('has an open question for every skill and every level', () => {
    for (const skill of getSkills()) {
      for (const { n } of SKILL_LEVELS) expect(getEvaluationPrompt(skill.id, n).length).toBeGreaterThan(20);
    }
  });
  it('is empty for an unknown skill', () => {
    expect(getEvaluationPrompt('nope', 1)).toBe('');
  });
});

describe('validateSubmission', () => {
  const ok = { profileId: 'p1', skillId: 'logique', level: 2, answer: 'x'.repeat(40) };
  it('accepts a complete answer', () => {
    expect(validateSubmission(ok)).toEqual({ ok: true, value: ok });
  });
  it.each([
    ['too short', { ...ok, answer: 'court' }],
    ['too long', { ...ok, answer: 'x'.repeat(2001) }],
    ['unknown skill', { ...ok, skillId: 'nope' }],
    ['bad level', { ...ok, level: 6 }],
    ['missing profile', { ...ok, profileId: '' }],
    ['not an object', null],
  ])('rejects %s', (_label, input) => {
    expect(validateSubmission(input).ok).toBe(false);
  });
});

describe('validateCorrection', () => {
  it('accepts a passed evaluation with an optional comment', () => {
    expect(validateCorrection({ status: 'passed', comment: ' Bien ! ' })).toEqual({ ok: true, value: { status: 'passed', comment: 'Bien !' } });
    expect(validateCorrection({ status: 'passed' }).ok).toBe(true);
  });
  it('requires a comment to refuse', () => {
    expect(validateCorrection({ status: 'failed', comment: '' }).ok).toBe(false);
  });
  it('rejects other statuses', () => {
    expect(validateCorrection({ status: 'pending' }).ok).toBe(false);
  });
});

describe('levelAfterEvaluations', () => {
  it('lifts the level above every passed evaluation, never lowers it', () => {
    expect(levelAfterEvaluations(1, [evalOf(2, 'passed')])).toBe(3);
    expect(levelAfterEvaluations(4, [evalOf(2, 'passed')])).toBe(4);
    expect(levelAfterEvaluations(null, [evalOf(1, 'passed')])).toBe(2);
  });
  it('ignores pending and failed evaluations and caps at 5', () => {
    expect(levelAfterEvaluations(2, [evalOf(4, 'pending'), evalOf(4, 'failed')])).toBe(2);
    expect(levelAfterEvaluations(null, [evalOf(4, 'pending')])).toBeNull();
    expect(levelAfterEvaluations(4, [evalOf(5, 'passed')])).toBe(5);
  });
});
