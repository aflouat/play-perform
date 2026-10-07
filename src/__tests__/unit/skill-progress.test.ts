import { getSkillLevelFor, setSkillLevel, advanceSkillLevel, getAllSkillLevels } from '@/modules/skills';

describe('skill progress (per profile, per skill)', () => {
  beforeEach(() => localStorage.clear());

  it('returns null when the skill has never been started', () => {
    expect(getSkillLevelFor('p1', 'fractions')).toBeNull();
  });

  it('keeps levels independent between skills', () => {
    setSkillLevel('p1', 'fractions', 3);
    setSkillLevel('p1', 'grammar', 1);
    expect(getSkillLevelFor('p1', 'fractions')).toBe(3);
    expect(getSkillLevelFor('p1', 'grammar')).toBe(1);
  });

  it('keeps levels independent between profiles', () => {
    setSkillLevel('p1', 'fractions', 4);
    expect(getSkillLevelFor('p2', 'fractions')).toBeNull();
  });

  it('advances one level at a time and caps at 5', () => {
    setSkillLevel('p1', 'fractions', 4);
    expect(advanceSkillLevel('p1', 'fractions')).toBe(5);
    expect(advanceSkillLevel('p1', 'fractions')).toBe(5);
  });

  it('starts a skill at level 1 when advancing without a placement', () => {
    expect(advanceSkillLevel('p1', 'grammar')).toBe(1);
  });

  it('lists all levels of a profile', () => {
    setSkillLevel('p1', 'fractions', 2);
    expect(getAllSkillLevels('p1')).toEqual({ fractions: 2 });
  });
});
