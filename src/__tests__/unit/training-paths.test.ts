import { GENERIC_PHASES, phasesOf, validatePathChoice } from '@/modules/dashboards/domain/training-path';
import { getTrainingPath, getTrainingPaths } from '@/modules/dashboards/infra/training-paths-seed';
import { getSkills, SKILL_LEVELS } from '@/modules/skills';

describe('training paths', () => {
  it('every path follows the 4 generic phases, with its own chapters', () => {
    expect(GENERIC_PHASES.map((p) => p.title)).toEqual(['Fondations', 'Bases', 'Consolidation', 'Approfondissement']);
    for (const path of getTrainingPaths()) {
      expect(phasesOf(path).map((p) => p.id)).toEqual(GENERIC_PHASES.map((p) => p.id));
    }
    const lab = phasesOf(getTrainingPath('technicien-laboratoire')!);
    const maths = phasesOf(getTrainingPath('mathematiques')!);
    expect(lab[0].title).toBe(maths[0].title);
    expect(lab[1].courses.map((c) => c.title)).not.toEqual(maths[1].courses.map((c) => c.title));
  });

  it('only references existing skills and levels, with a pedagogical chapter title', () => {
    const skillIds = new Set(getSkills().map((s) => s.id));
    for (const path of getTrainingPaths()) {
      for (const phase of phasesOf(path)) {
        expect(phase.weeks).toBeGreaterThan(0);
        for (const c of phase.courses) {
          expect(c.title.length).toBeGreaterThan(3);
          expect(skillIds.has(c.skillId)).toBe(true);
          if (c.requires) expect(skillIds.has(c.requires.skillId)).toBe(true);
          expect(SKILL_LEVELS.map((l) => l.n)).toContain(c.targetLevel);
        }
      }
    }
  });

  it('unknown path: none', () => {
    expect(getTrainingPath('nope')).toBeNull();
  });
});

describe('path choice', () => {
  const IDS = getTrainingPaths().map((p) => p.id);
  it('a learner chooses once; afterwards the centre decides', () => {
    expect(validatePathChoice({ pathId: 'mathematiques' }, 'learner', null, IDS)).toEqual({ ok: true, value: 'mathematiques' });
    expect(validatePathChoice({ pathId: 'technicien-laboratoire' }, 'learner', 'mathematiques', IDS))
      .toEqual({ ok: false, error: 'Ton parcours est fixé par ton centre de formation.', status: 403 });
  });

  it('a teacher can change it, or clear it', () => {
    expect(validatePathChoice({ pathId: 'technicien-laboratoire' }, 'teacher', 'mathematiques', IDS)).toEqual({ ok: true, value: 'technicien-laboratoire' });
    expect(validatePathChoice({ pathId: null }, 'teacher', 'mathematiques', IDS)).toEqual({ ok: true, value: null });
    expect(validatePathChoice({ pathId: null }, 'learner', null, IDS)).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects an unknown path', () => {
    expect(validatePathChoice({ pathId: 'astronaute' }, 'teacher', null, IDS)).toEqual({ ok: false, error: 'Parcours inconnu.', status: 400 });
    expect(validatePathChoice('x', 'teacher', null, IDS)).toMatchObject({ ok: false, status: 400 });
  });
});
