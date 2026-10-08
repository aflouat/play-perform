'use client';

import Link from 'next/link';
import type { Skill, SkillLevelNumber } from '../domain/skill';
import { loadSkillReviews } from '../infra/skill-reviews';
import { SkillLevelMeter } from './SkillLevelMeter';
import { ReviewsSummary } from './ReviewsSummary';
import { GoalEditor } from './GoalEditor';

interface Props { skill: Skill; profileId: string; level: SkillLevelNumber | null; now: Date }

/** What the learner sees when clicking a building: level, reviews done and planned, goal date. */
export function SkillDetailPanel({ skill, profileId, level, now }: Props) {
  const reviews = loadSkillReviews(profileId, skill.id, now);
  return (
    <section aria-label={skill.name} className="space-y-4 rounded-3xl border border-violet-200 bg-white p-5 shadow-lg">
      <header>
        <h2 className="text-lg font-black text-[#1a1a2e]">{skill.emoji} {skill.name}</h2>
        <p className="text-xs text-slate-500">{skill.description}</p>
      </header>
      <SkillLevelMeter level={level} />
      <ReviewsSummary reviews={reviews} />
      <GoalEditor profileId={profileId} skillId={skill.id} level={level} now={now} />
      <Link href={`/competences/${skill.id}`} className="block rounded-2xl bg-violet-600 py-3 text-center font-bold text-white">Progresser →</Link>
    </section>
  );
}
