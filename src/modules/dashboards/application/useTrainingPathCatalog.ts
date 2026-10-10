'use client';

import { useEffect, useState } from 'react';
import type { TrainingPath } from '../domain/training-path';
import { getTrainingPaths } from '../infra/training-paths-seed';
import { fetchTrainingPathCatalog } from '../infra/dashboard-client';

/** Training paths from the database (edited by the parent company); the built-in ones until it answers, or if it cannot. */
export function useTrainingPathCatalog(): { paths: readonly TrainingPath[]; loaded: boolean } {
  const [state, setState] = useState<{ paths: readonly TrainingPath[]; loaded: boolean }>({ paths: getTrainingPaths(), loaded: false });
  useEffect(() => {
    let alive = true;
    fetchTrainingPathCatalog().then((paths) => {
      if (alive) setState({ paths: paths && paths.length > 0 ? paths : getTrainingPaths(), loaded: true });
    });
    return () => { alive = false; };
  }, []);
  return state;
}

/** Paths offered for a new choice (an inactive path is kept by those who follow it). */
export const activePaths = (paths: readonly TrainingPath[]) => paths.filter((p) => p.active !== false);
