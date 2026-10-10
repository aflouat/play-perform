import { getAuthToken } from '@/lib/auth-token';
import type { TrainingPath } from '../domain/training-path';

/** Saves a path of the catalogue (parent company): creation or update. Returns the error to show, or null. */
export async function saveCatalogPath(path: TrainingPath & { active: boolean }, isNew: boolean): Promise<string | null> {
  try {
    const res = await fetch(isNew ? '/api/training-paths' : `/api/training-paths/${encodeURIComponent(path.id)}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${await getAuthToken()}` },
      body: JSON.stringify(path),
    });
    return res.ok ? null : ((await res.json().catch(() => ({}))) as { error?: string }).error ?? 'Enregistrement impossible.';
  } catch { return 'Enregistrement impossible.'; }
}
