import { getServerClient } from '@/lib/db/client';
import type { GenericPhaseId, PathPhase, TrainingPath } from '../domain/training-path';
import { getTrainingPaths } from './training-paths-seed';

/** Server-side only (service role): the catalogue of training paths, edited by the parent company. */
interface Row { id: string; name: string; emoji: string; description: string; phases: Record<GenericPhaseId, PathPhase>; active: boolean }

const table = () => getServerClient().from('training_paths');
const toRow = (p: TrainingPath & { active: boolean }) => ({ id: p.id, name: p.name, emoji: p.emoji, description: p.description, phases: p.phases, active: p.active });

export async function listTrainingPaths(): Promise<TrainingPath[]> {
  const { data, error } = await table().select('id, name, emoji, description, phases, active').order('sort_order').order('created_at');
  if (error) throw new Error(error.message);
  return (data ?? []) as Row[];
}

/** Identifiers a learner or a centre may choose: the active paths (built-in ones while the table is missing or empty). */
export async function choosablePathIds(): Promise<string[]> {
  try {
    const paths = await listTrainingPaths();
    if (paths.length > 0) return paths.filter((p) => p.active !== false).map((p) => p.id);
  } catch { /* table not migrated yet */ }
  return getTrainingPaths().map((p) => p.id);
}

export async function insertTrainingPath(path: TrainingPath & { active: boolean }): Promise<'created' | 'exists'> {
  const { error } = await table().insert({ ...toRow(path), sort_order: 100 });
  if (error?.code === '23505') return 'exists';
  if (error) throw new Error(error.message);
  return 'created';
}

export async function updateTrainingPath(path: TrainingPath & { active: boolean }): Promise<'updated' | 'missing'> {
  const { data, error } = await table().update({ ...toRow(path), updated_at: new Date().toISOString() }).eq('id', path.id).select('id');
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0 ? 'updated' : 'missing';
}

/** Paths offered to new learners, for public pages (built-in ones while the table is missing or empty). */
export async function offeredPaths(): Promise<TrainingPath[]> {
  try {
    const paths = await listTrainingPaths();
    if (paths.length > 0) return paths.filter((p) => p.active !== false);
  } catch { /* table not migrated yet */ }
  return [...getTrainingPaths()];
}
