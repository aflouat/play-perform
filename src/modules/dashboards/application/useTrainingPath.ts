'use client';

import { useCallback, useEffect, useState } from 'react';
import type { TrainingPath } from '../domain/training-path';
import { useTrainingPathCatalog } from './useTrainingPathCatalog';
import { fetchTrainingPath, saveTrainingPath } from '../infra/dashboard-client';
import { cachePath, getCachedPath } from '../infra/roadmap-storage';

export interface TrainingPathState {
  /** False until the database answered (or turned out to be unavailable) */
  loaded: boolean;
  path: TrainingPath | null;
  /** The whole catalogue */
  paths: readonly TrainingPath[];
  choose: (pathId: string) => Promise<string | null>;
}

/** The learner's training path: the database decides; the device keeps a copy (instant display, demo profiles). Client only. */
export function useTrainingPath(profileId: string): TrainingPathState {
  const [pathId, setPathId] = useState<string | null>(() => getCachedPath(profileId));
  const [loaded, setLoaded] = useState(false);
  const catalog = useTrainingPathCatalog();

  useEffect(() => {
    let alive = true;
    fetchTrainingPath(profileId).then((stored) => {
      if (!alive) return;
      if (stored !== undefined) { setPathId(stored); cachePath(profileId, stored); }
      setLoaded(true);
    });
    return () => { alive = false; };
  }, [profileId]);

  const choose = useCallback(async (next: string) => {
    const error = await saveTrainingPath(profileId, next);
    // A demo profile has no account: its choice stays on the device
    if (error && !profileId.startsWith('demo-')) return error;
    setPathId(next);
    cachePath(profileId, next);
    return null;
  }, [profileId]);

  return { loaded: loaded && catalog.loaded, path: catalog.paths.find((p) => p.id === pathId) ?? null, paths: catalog.paths, choose };
}
