'use client';

import { useMemo, type ReactNode } from 'react';
import { useSkillLevels } from '@/modules/skills';
import { useTrainingPath } from '../application/useTrainingPath';
import { buildRoadmap, currentSkillIds } from '../domain/roadmap';
import { phasesOf } from '../domain/training-path';
import { LearnerHome } from './LearnerHome';
import { PathRoadmap } from './PathRoadmap';
import { TrainingPathPicker } from './TrainingPathPicker';
import { Scorecard } from './Scorecard';
import { LearnerFeed } from './LearnerFeed';

/**
 * The learner's command center. Main column (≈ 75 %): trajectory and action — treasure map of their training path, "Reprendre",
 * today's list, then `children` (given the skills of the path: the town shows its trade skills). Side column (≈ 25 %): status and emotion — streak, rank, badges, social feed. On a phone the status comes first.
 */
export function CommandCenter({ profileId, children }: { profileId: string; children?: (pathSkillIds: readonly string[]) => ReactNode }) {
  const { loaded, path, paths, choose } = useTrainingPath(profileId);
  const levels = useSkillLevels(profileId);
  const pathSkillIds = useMemo(() => (path ? [...new Set(phasesOf(path).flatMap((p) => p.courses.map((c) => c.skillId)))] : []), [path]);
  const feedSkills = useMemo(
    () => (path ? currentSkillIds(buildRoadmap(phasesOf(path), levels, { startedAt: '2000-01-01', completedAt: {} }, '2000-01-01')) : []),
    [path, levels],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_1fr] lg:grid-rows-[auto_1fr]">
      <aside className="lg:col-start-2 lg:row-start-1">
        <Scorecard profileId={profileId} />
      </aside>
      <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        {path
          ? <PathRoadmap key={path.id} profileId={profileId} path={path} />
          : loaded && <TrainingPathPicker paths={paths} onChoose={choose} />}
        <LearnerHome profileId={profileId} />
        {children?.(pathSkillIds)}
      </div>
      <aside className="lg:col-start-2 lg:row-start-2 lg:self-start">
        <LearnerFeed profileId={profileId} skillIds={feedSkills} />
      </aside>
    </div>
  );
}
