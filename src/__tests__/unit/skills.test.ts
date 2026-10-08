import { getSkills, getSkillById, SKILL_LEVELS } from '@/modules/skills';

describe('skills module', () => {
  it('exposes 9 skills with unique ids', () => {
    const ids = getSkills().map((s) => s.id);
    expect(ids).toHaveLength(9);
    expect(new Set(ids).size).toBe(9);
  });

  it('finds a skill by id', () => {
    expect(getSkillById('logique')?.domain).toBe('Logique');
    expect(getSkillById('nope')).toBeUndefined();
  });

  it('describes the 5 levels of a skill path', () => {
    expect(SKILL_LEVELS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5]);
  });
});
