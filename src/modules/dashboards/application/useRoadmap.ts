'use client';

import { useEffect, useMemo, useState } from 'react';
import { toDay, useSkillLevels } from '@/modules/skills';
import { buildRoadmap, newlyCompleted, resumeTarget, type PhaseView, type ResumeTarget } from '../domain/roadmap';
import { getRoadmap } from '../infra/roadmap-seed';
import { getLastSkill, loadRoadmapProgress, recordCompletions } from '../infra/roadmap-storage';

/**
 * The learner's roadmap, recomputed live from the levels (synced with the database), and where to resume.
 * Client only (reads the device storage once on mount): key the caller by profile.
 */
export function useRoadmap(profileId: string): { phases: PhaseView[]; resume: ResumeTarget } {
  const levels = useSkillLevels(profileId);
  const today = toDay(new Date());
  const [stored] = useState(() => loadRoadmapProgress(profileId, today));
  const [lastSkill] = useState(() => getLastSkill(profileId));

  const { phases, fresh } = useMemo(() => {
    const completions = newlyCompleted(buildRoadmap(getRoadmap(), levels, stored, today), today);
    const progress = { ...stored, completedAt: { ...stored.completedAt, ...completions } };
    return { phases: buildRoadmap(getRoadmap(), levels, progress, today), fresh: completions };
  }, [levels, stored, today]);

  // A phase just completed: remember the day (its actual date versus the target date)
  useEffect(() => {
    if (Object.keys(fresh).length > 0) recordCompletions(profileId, stored, fresh);
  }, [fresh, profileId, stored]);

  return useMemo(() => ({ phases, resume: resumeTarget(phases, lastSkill) }), [phases, lastSkill]);
}
