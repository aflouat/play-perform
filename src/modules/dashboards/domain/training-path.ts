import type { RoadmapCourse, RoadmapPhase } from './roadmap';

/** The 4 phases shared by every training path; what is learnt in each depends on the path. */
export const GENERIC_PHASES = [
  { id: 'fondations', title: 'Fondations' },
  { id: 'bases', title: 'Bases' },
  { id: 'consolidation', title: 'Consolidation' },
  { id: 'approfondissement', title: 'Approfondissement' },
] as const;

export type GenericPhaseId = (typeof GENERIC_PHASES)[number]['id'];

/** What one path teaches in a generic phase: its duration and its chapters. */
export interface PathPhase { weeks: number; chapters: RoadmapCourse[] }

/** A training path ("parcours de formation"), e.g. lab technician or mathematics: its own chapters in the generic phases. */
export interface TrainingPath {
  id: string; name: string; emoji: string; description: string;
  phases: Record<GenericPhaseId, PathPhase>;
  /** Offered to new learners (an inactive path stays visible to those who follow it). Absent = active. */
  active?: boolean;
}

/** The learner's roadmap for a path: the generic phases, filled with the path's chapters. */
export function phasesOf(path: TrainingPath): RoadmapPhase[] {
  return GENERIC_PHASES.map(({ id, title }) => ({ id, title, weeks: path.phases[id].weeks, courses: path.phases[id].chapters }));
}

export type PathChoice = { ok: true; value: string | null } | { ok: false; error: string; status: 400 | 403 };

/**
 * Body of PUT /api/training-path. The centre (teacher) assigns or changes the path, or clears it;
 * a learner may only pick a first path when none is set.
 */
export function validatePathChoice(input: unknown, actor: 'learner' | 'teacher', current: string | null, knownIds: readonly string[]): PathChoice {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Requête invalide.', status: 400 };
  const pathId = (input as Record<string, unknown>).pathId;
  if (pathId === null && actor === 'teacher') return { ok: true, value: null };
  if (typeof pathId !== 'string') return { ok: false, error: 'Parcours manquant.', status: 400 };
  if (!knownIds.includes(pathId)) return { ok: false, error: 'Parcours inconnu.', status: 400 };
  if (actor === 'learner' && current !== null && current !== pathId) {
    return { ok: false, error: 'Ton parcours est fixé par ton centre de formation.', status: 403 };
  }
  return { ok: true, value: pathId };
}
