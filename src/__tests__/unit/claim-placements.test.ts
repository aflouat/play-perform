import { claimVisitorPlacements, savePlacement } from '@/modules/landing';
import { getAllSkillLevels, setSkillLevel } from '@/modules/skills';

const result = (startLevel: 1 | 2 | 3 | 4 | 5) => ({ startLevel, correct: startLevel - 1, skipped: 0, total: 5, mastered: false });

describe('claimVisitorPlacements', () => {
  beforeEach(() => localStorage.clear());

  it('uses the visitor test results as starting levels of the first profile', () => {
    savePlacement('maths-fractions', result(3));
    savePlacement('logique', result(2));
    claimVisitorPlacements('kid1');
    expect(getAllSkillLevels('kid1')).toEqual({ 'maths-fractions': 3, logique: 2 });
  });

  it('never overrides a level the profile already has', () => {
    setSkillLevel('kid1', 'logique', 4);
    savePlacement('logique', result(2));
    claimVisitorPlacements('kid1');
    expect(getAllSkillLevels('kid1').logique).toBe(4);
  });

  it('gives the results to one profile only', () => {
    savePlacement('logique', result(3));
    claimVisitorPlacements('kid1');
    claimVisitorPlacements('kid2');
    expect(getAllSkillLevels('kid2')).toEqual({});
  });

  it('does nothing when the visitor never took a test', () => {
    claimVisitorPlacements('kid1');
    expect(getAllSkillLevels('kid1')).toEqual({});
  });
});
