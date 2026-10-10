'use client';

import { useRoadmap } from '../application/useRoadmap';
import type { TrainingPath } from '../domain/training-path';
import { RoadmapBanner } from './RoadmapBanner';
import { ResumeButton } from './ResumeButton';

/** The treasure map of the learner's training path and the "Reprendre" button (key it by profile and path). */
export function PathRoadmap({ profileId, path }: { profileId: string; path: TrainingPath }) {
  const roadmap = useRoadmap(profileId, path);
  return (
    <>
      <RoadmapBanner phases={roadmap.phases} path={path} />
      <ResumeButton target={roadmap.resume} />
    </>
  );
}
