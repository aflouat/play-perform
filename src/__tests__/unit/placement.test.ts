import { estimateStartLevel, scoreAnswer, getPlacementTest } from '@/modules/quizzes';
import { getSkills } from '@/modules/skills';
import type { PlacementAnswer } from '@/modules/quizzes';

const answers = (pattern: Array<boolean | null>): PlacementAnswer[] =>
  pattern.map((r, i) => ({ questionId: `q${i + 1}`, level: (i + 1) as 1 | 2 | 3 | 4 | 5, correct: r === true, skipped: r === null }));

describe('estimateStartLevel', () => {
  it('starts at level 1 when nothing is correct', () => {
    expect(estimateStartLevel(answers([false, false, false, false, false]))).toMatchObject({ startLevel: 1, correct: 0, mastered: false });
  });

  it('starts at the first level not yet acquired', () => {
    expect(estimateStartLevel(answers([true, true, false, false, false])).startLevel).toBe(3);
  });

  it('tolerates a slip on an easy question', () => {
    expect(estimateStartLevel(answers([false, true, true, true, false])).startLevel).toBe(4);
  });

  it('counts "Je ne sais pas" as not acquired', () => {
    expect(estimateStartLevel(answers([true, null, null, null, null]))).toMatchObject({ startLevel: 2, skipped: 4 });
  });

  it('caps at level 5 and flags mastery when everything is correct', () => {
    expect(estimateStartLevel(answers([true, true, true, true, true]))).toMatchObject({ startLevel: 5, correct: 5, mastered: true });
  });

  it('handles an empty test', () => {
    expect(estimateStartLevel([])).toMatchObject({ startLevel: 1, total: 0, mastered: false });
  });
});

describe('scoreAnswer', () => {
  const [question] = getPlacementTest('maths-fractions');

  it('marks the right option as correct', () => {
    expect(scoreAnswer(question, question.correctIndex)).toMatchObject({ correct: true, skipped: false, level: 1 });
  });

  it('marks a skipped question', () => {
    expect(scoreAnswer(question, null)).toMatchObject({ correct: false, skipped: true });
  });
});

describe('placement bank', () => {
  it.each(getSkills().map((s) => [s.id]))('« %s » has one valid question per level 1→5', (skillId) => {
    const test = getPlacementTest(skillId);
    expect(test.map((q) => q.level)).toEqual([1, 2, 3, 4, 5]);
    for (const q of test) {
      expect(q.options.length).toBe(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
    }
  });

  it('does not always put the right answer at the same position', () => {
    const positions = getSkills().flatMap((s) => getPlacementTest(s.id).map((q) => q.correctIndex));
    expect(new Set(positions).size).toBe(4);
  });

  it('returns an empty test for an unknown skill', () => {
    expect(getPlacementTest('unknown')).toEqual([]);
  });
});
