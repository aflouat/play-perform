import { mergeLevels, validateLevelUpdate, applyPlacements, pickSkillQuestions, getEvaluationPrompt, getSkillById } from '@/modules/skills';
import { getPlacementTest } from '@/modules/quizzes';

describe('mergeLevels', () => {
  it('keeps the highest level of each skill from both sides', () => {
    expect(mergeLevels({ a: 2, b: 4 }, { a: 3, c: 1 })).toEqual({ a: 3, b: 4, c: 1 });
  });
});

describe('applyPlacements', () => {
  it('sets the starting level only for skills without a level', () => {
    const result = applyPlacements({ a: 3 }, { a: 5, b: 2 });
    expect(result).toEqual({ a: 3, b: 2 });
  });
  it('returns the same levels when there is nothing to apply', () => {
    expect(applyPlacements({ a: 1 }, {})).toEqual({ a: 1 });
  });
});

describe('validateLevelUpdate', () => {
  it('accepts a known skill and a level from 1 to 5', () => {
    const input = { profileId: 'p1', skillId: 'logique', level: 3 };
    expect(validateLevelUpdate(input)).toEqual({ ok: true, value: input });
  });
  it.each([
    [{ profileId: '', skillId: 'logique', level: 3 }],
    [{ profileId: 'p1', skillId: 'nope', level: 3 }],
    [{ profileId: 'p1', skillId: 'logique', level: 0 }],
    [{ profileId: 'p1', skillId: 'logique', level: 2.5 }],
    [null],
  ])('rejects %j', (input) => {
    expect(validateLevelUpdate(input).ok).toBe(false);
  });
});

describe('Claude Platform skill', () => {
  it('is in the catalogue with a quiz bank, a placement test and evaluation prompts', () => {
    expect(getSkillById('claude-platform-docs')?.name).toMatch(/Claude/);
    expect(pickSkillQuestions('claude-platform-docs', 3, 5)).toHaveLength(5);
    expect(getPlacementTest('claude-platform-docs').map((q) => q.level)).toEqual([1, 2, 3, 4, 5]);
    expect(getEvaluationPrompt('claude-platform-docs', 5)).toMatch(/cache/i);
  });
  it('has well-formed quiz questions (unique ids, one right option among four)', () => {
    const all = pickSkillQuestions('claude-platform-docs', 4, 100);
    expect(new Set(all.map((q) => q.id)).size).toBe(all.length);
    all.forEach((q) => {
      expect(q.options.map((o) => o.id)).toEqual(['A', 'B', 'C', 'D']);
      expect(q.options.some((o) => o.id === q.correctOptionId)).toBe(true);
    });
  });
});
