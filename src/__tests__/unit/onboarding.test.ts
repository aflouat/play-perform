import { onboardingSteps, firstQuizHref, applyStartLevel } from '@/modules/dashboards';

describe('onboardingSteps (first connection)', () => {
  it('starts with the profile, then the level test, then the first quiz', () => {
    const s = onboardingSteps({ identityReady: false, hasLevel: false, hasXp: false });
    expect(s.steps.map((x) => [x.id, x.state])).toEqual([['profile', 'current'], ['level', 'todo'], ['quiz', 'todo']]);
    expect(s.current).toBe('profile');
    expect(s.done).toBe(false);
  });

  it('moves on as each step is accomplished', () => {
    expect(onboardingSteps({ identityReady: true, hasLevel: false, hasXp: false }).current).toBe('level');
    const third = onboardingSteps({ identityReady: true, hasLevel: true, hasXp: false });
    expect(third.steps.map((x) => x.state)).toEqual(['done', 'done', 'current']);
  });

  it('is done once the first quiz earned XP', () => {
    const s = onboardingSteps({ identityReady: true, hasLevel: true, hasXp: true });
    expect(s).toMatchObject({ done: true, current: null });
  });

  it('does not block a learner who already has progress but never filled the profile', () => {
    const s = onboardingSteps({ identityReady: false, hasLevel: true, hasXp: true });
    expect(s.steps.map((x) => x.state)).toEqual(['current', 'done', 'done']);
    expect(s.done).toBe(false);
  });
});

describe('firstQuizHref', () => {
  it('opens the quiz of the skill just tested', () => {
    expect(firstQuizHref('logique')).toBe('/competences/logique?activity=quiz');
    expect(firstQuizHref(null)).toBe('/competences');
  });
});

describe('applyStartLevel', () => {
  it('uses the tested level as the starting point', () => {
    expect(applyStartLevel(null, 3)).toBe(3);
  });
  it('never lowers a level already earned', () => {
    expect(applyStartLevel(4, 2)).toBe(4);
    expect(applyStartLevel(2, 5)).toBe(5);
  });
});
