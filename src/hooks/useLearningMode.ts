'use client';

import { useState, useCallback } from 'react';
import { loadMode, saveMode, type LearningMode } from '@/lib/learning-mode';

interface UseLearningModeReturn {
  mode: LearningMode;
  isAssisted: boolean;
  setMode: (m: LearningMode) => void;
  toggleMode: () => void;
}

export function useLearningMode(profileId: string, defaultMode: LearningMode = 'advanced'): UseLearningModeReturn {
  const [mode, setModeState] = useState<LearningMode>(() => loadMode(profileId, defaultMode));

  const setMode = useCallback((m: LearningMode) => {
    setModeState(m);
    saveMode(profileId, m);
  }, [profileId]);

  const toggleMode = useCallback(() => {
    setMode(mode === 'assisted' ? 'advanced' : 'assisted');
  }, [mode, setMode]);

  return { mode, isAssisted: mode === 'assisted', setMode, toggleMode };
}
