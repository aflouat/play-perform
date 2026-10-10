'use client';

import { useEffect, useMemo, useState } from 'react';
import { toDay, useSkillLevels } from '@/modules/skills';
import { buildRoadmap, newlyCompleted, resumeTarget, type PhaseView, type ResumeTarget } from '../domain/roadmap';
import { phasesOf, type TrainingPath } from '../domain/training-path';
import { getLastSkill, loadRoadmapProgress, recordCompletions } from '../infra/roadmap-storage';

/**
 * The learner's roadmap in their training path, recomputed live from the levels (synced with the database), and where to resume.
 * Client only (reads the device storage once on mount): key the caller by profile and path.
 */
export function useRoadmap(profileId: string, path: TrainingPath): { phases: PhaseView[]; resume: ResumeTarget } {
  const levels = useSkillLevels(profileId);
  const today = toDay(new Date());
  const [stored] = useState(() => loadRoadmapProgress(profileId, path.id, today));
  const [lastSkill] = useState(() => getLastSkill(profileId));
  const definition = useMemo(() => phasesOf(path), [path]);

  const { phases, fresh } = useMemo(() => {
    const completions = newlyCompleted(buildRoadmap(definition, levels, stored, today), today);
    const progress = { ...stored, completedAt: { ...stored.completedAt, ...completions } };
    return { phases: buildRoadmap(definition, levels, progress, today), fresh: completions };
  }, [definition, levels, stored, today]);

  // A phase just completed: remember the day (its actual date versus the target date)
  useEffect(() => {
    if (Object.keys(fresh).length > 0) recordCompletions(profileId, path.id, stored, fresh);
  }, [fresh, profileId, path.id, stored]);

  return useMemo(() => ({ phases, resume: resumeTarget(phases, lastSkill) }), [phases, lastSkill]);
}
