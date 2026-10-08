'use client';

import Link from 'next/link';
import { getSkills } from '../infra/skills-repository';
import { useSkillLevels } from '../application/skill-progress';
import { SkillLevelMeter } from './SkillLevelMeter';

/** Every skill of the learner's project with the level reached, before choosing an activity. */
export function SkillsDashboard({ profileId }: { profileId: string }) {
  const levels = useSkillLevels(profileId);
  return (
    <ul className="grid gap-3">
      {getSkills().map((skill) => (
        <li key={skill.id}>
          <Link href={`/competences/${skill.id}`}
            className="block rounded-2xl bg-white p-4 shadow-sm border border-slate-200 hover:border-violet-400 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl" aria-hidden>{skill.emoji}</span>
              <div>
                <p className="font-black text-[#1a1a2e] leading-tight">{skill.name}</p>
                <p className="text-xs text-slate-400">{skill.domain}</p>
              </div>
            </div>
            <SkillLevelMeter level={levels[skill.id] ?? null} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
