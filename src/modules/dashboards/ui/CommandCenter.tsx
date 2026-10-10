'use client';

import type { ReactNode } from 'react';
import { useRoadmap } from '../application/useRoadmap';
import { LearnerHome } from './LearnerHome';
import { RoadmapBanner } from './RoadmapBanner';
import { ResumeButton } from './ResumeButton';
import { Scorecard } from './Scorecard';
import { LearnerFeed } from './LearnerFeed';

/**
 * The learner's command center. Main column (≈ 75 %): trajectory and action — treasure map, "Reprendre", today's list, `children`.
 * Side column (≈ 25 %): status and emotion — streak, rank, badges, social feed. On a phone the status comes first.
 */
export function CommandCenter({ profileId, children }: { profileId: string; children?: ReactNode }) {
  const roadmap = useRoadmap(profileId);
  const current = roadmap.phases.find((p) => p.status === 'current');
  const currentSkills = current ? [...new Set(current.courses.filter((c) => c.state !== 'done').map((c) => c.skillId))] : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[3fr_1fr] lg:grid-rows-[auto_1fr]">
      <aside className="lg:col-start-2 lg:row-start-1">
        <Scorecard profileId={profileId} />
      </aside>
      <div className="min-w-0 space-y-6 lg:col-start-1 lg:row-span-2 lg:row-start-1">
        <RoadmapBanner phases={roadmap.phases} />
        <ResumeButton target={roadmap.resume} />
        <LearnerHome profileId={profileId} />
        {children}
      </div>
      <aside className="lg:col-start-2 lg:row-start-2 lg:self-start">
        <LearnerFeed profileId={profileId} skillIds={currentSkills} />
      </aside>
    </div>
  );
}
