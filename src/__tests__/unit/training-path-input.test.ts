import { emptyTrainingPath, slugify, validateTrainingPath } from '@/modules/dashboards/domain/training-path-input';
import { getTrainingPaths } from '@/modules/dashboards/infra/training-paths-seed';
import { getSkills } from '@/modules/skills';

const SKILLS = getSkills().map((s) => s.id);
const valid = () => JSON.parse(JSON.stringify({ ...getTrainingPaths()[1], active: true }));

describe('training path input (editor of the parent company)', () => {
  it('accepts every seeded path', () => {
    for (const path of getTrainingPaths()) expect(validateTrainingPath({ ...path, active: true }, SKILLS)).toMatchObject({ ok: true });
  });

  it('the lab path uses the lab trade skills', () => {
    const lab = getTrainingPaths().find((p) => p.id === 'technicien-laboratoire')!;
    const used = new Set(Object.values(lab.phases).flatMap((p) => p.chapters.map((c) => c.skillId)));
    for (const id of ['labo-securite', 'labo-solutions', 'labo-mesures', 'labo-qualite']) expect(used.has(id)).toBe(true);
  });

  it('trims texts and keeps only known fields', () => {
    const input = { ...valid(), name: '  Technicien Pharma  ', extra: 'x' };
    const result = validateTrainingPath(input, SKILLS);
    expect(result.ok && result.value.name).toBe('Technicien Pharma');
    expect(result.ok && 'extra' in result.value).toBe(false);
  });

  it.each([
    ['an invalid identifier', (p: Record<string, unknown>) => { p.id = 'Technicien Pharma'; }, /identifiant/i],
    ['a too short name', (p: Record<string, unknown>) => { p.name = 'ab'; }, /nom/i],
    ['a missing phase', (p: { phases: Record<string, unknown> }) => { delete p.phases.bases; }, /Bases/],
    ['a phase without chapter', (p: { phases: Record<string, { chapters: unknown[] }> }) => { p.phases.bases.chapters = []; }, /au moins un chapitre/],
    ['a duration of 0 week', (p: { phases: Record<string, { weeks: number }> }) => { p.phases.bases.weeks = 0; }, /semaines/],
    ['an unknown skill', (p: { phases: Record<string, { chapters: { skillId: string }[] }> }) => { p.phases.bases.chapters[0].skillId = 'astronautique'; }, /compétence inconnue/i],
    ['a level 6', (p: { phases: Record<string, { chapters: { targetLevel: number }[] }> }) => { p.phases.bases.chapters[0].targetLevel = 6; }, /niveau/i],
    ['a requirement on the same skill', (p: { phases: Record<string, { chapters: { skillId: string; requires?: unknown }[] }> }) => {
      const c = p.phases.bases.chapters[0]; c.requires = { skillId: c.skillId, level: 1 };
    }, /autre compétence/],
  ])('rejects %s', (_label, mutate, error) => {
    const input = valid();
    (mutate as (p: unknown) => void)(input);
    const result = validateTrainingPath(input, SKILLS);
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toMatch(error);
  });

  it('builds identifiers and an empty path for the editor', () => {
    expect(slugify('Technicien Pharma (BTS) — Environnement')).toBe('technicien-pharma-bts-environnement');
    const empty = emptyTrainingPath();
    expect(Object.keys(empty.phases)).toEqual(['fondations', 'bases', 'consolidation', 'approfondissement']);
    expect(empty.active).toBe(false);
  });
});
