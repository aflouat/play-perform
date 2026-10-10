import type { RoadmapPhase } from '../domain/roadmap';

/** Default roadmap of a learner (POC: local seed, common to every centre, like the skills catalogue). */
export const ROADMAP_SEED: readonly RoadmapPhase[] = [
  { id: 'fondations', title: 'Fondations', weeks: 3, courses: [
    { skillId: 'methode', targetLevel: 2 },
    { skillId: 'logique', targetLevel: 1 },
  ] },
  { id: 'bases', title: 'Les bases du collège', weeks: 4, courses: [
    { skillId: 'maths-fractions', targetLevel: 2, requires: { skillId: 'logique', level: 2 } },
    { skillId: 'francais-accords', targetLevel: 2, requires: { skillId: 'methode', level: 2 } },
    { skillId: 'histoire-reperes', targetLevel: 2 },
  ] },
  { id: 'consolidation', title: 'Consolidation', weeks: 5, courses: [
    { skillId: 'maths-fractions', targetLevel: 3, requires: { skillId: 'logique', level: 3 } },
    { skillId: 'physique-energie', targetLevel: 2, requires: { skillId: 'maths-fractions', level: 2 } },
    { skillId: 'anglais-comprendre', targetLevel: 3 },
  ] },
  { id: 'approfondissement', title: 'Approfondissement', weeks: 6, courses: [
    { skillId: 'logique', targetLevel: 4 },
    { skillId: 'maths-fractions', targetLevel: 4, requires: { skillId: 'logique', level: 4 } },
    { skillId: 'svt-vivant', targetLevel: 3 },
  ] },
];

export function getRoadmap(): readonly RoadmapPhase[] {
  return ROADMAP_SEED;
}
