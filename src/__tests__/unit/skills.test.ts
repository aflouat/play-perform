import { getSkills, getSkillById, SKILL_LEVELS, isGeneralSkill, getSkillBank, hasQuestionBank, getEvaluationPrompt } from '@/modules/skills';
import { challengeFor } from '@/modules/competition';
import { getPlacementTest } from '@/modules/quizzes';

describe('skills module', () => {
  it('exposes 9 general skills and 4 lab-technician skills, with unique ids', () => {
    const ids = getSkills().map((s) => s.id);
    expect(new Set(ids).size).toBe(13);
    expect(getSkills().filter(isGeneralSkill)).toHaveLength(9);
    expect(getSkills().filter((s) => s.trade === 'laboratoire').map((s) => s.id))
      .toEqual(['labo-securite', 'labo-solutions', 'labo-mesures', 'labo-qualite']);
  });

  it('gives every lab skill a quiz bank covering difficulties 1 → 4, a placement test and evaluation prompts', () => {
    for (const skill of getSkills().filter((s) => s.trade === 'laboratoire')) {
      expect(hasQuestionBank(skill.id)).toBe(true);
      const bank = getSkillBank(skill.id);
      expect(new Set(bank.map((q) => q.difficulty))).toEqual(new Set([1, 2, 3, 4]));
      expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
      expect(new Set(bank.map((q) => q.correctOptionId)).size).toBeGreaterThan(2);
      expect(getPlacementTest(skill.id)).toHaveLength(5);
      expect(getEvaluationPrompt(skill.id, 5).length).toBeGreaterThan(20);
    }
  });

  it('keeps trade skills out of the weekly challenge shared by the whole centre', () => {
    for (let w = 1; w <= 52; w++) {
      const week = `2026-W${String(w).padStart(2, '0')}`;
      expect(getSkillById(challengeFor(week).skillId)?.trade).toBeUndefined();
    }
  });

  it('finds a skill by id', () => {
    expect(getSkillById('logique')?.domain).toBe('Logique');
    expect(getSkillById('nope')).toBeUndefined();
  });

  it('describes the 5 levels of a skill path', () => {
    expect(SKILL_LEVELS.map((l) => l.n)).toEqual([1, 2, 3, 4, 5]);
  });
});
