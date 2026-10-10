'use client';

import { useState } from 'react';
import { getSkills } from '../infra/skills-repository';
import { isGeneralSkill } from '../domain/skill';
import { useSkillLevels } from '../application/skill-progress';
import { useEnrollments } from '../application/use-enrollments';
import { isEnrolled } from '../domain/enrollment';
import { BuildingTile } from './BuildingTile';
import { SkillDetailPanel } from './SkillDetailPanel';

/**
 * The learner's town: one building per skill of their programme; click one to see its level, reviews and goal.
 * Trade skills show only when the learner's training path uses them (`tradeSkillIds`) or once they have a level in them.
 */
export function SkillMap({ profileId, tradeSkillIds = [] }: { profileId: string; tradeSkillIds?: readonly string[] }) {
  const levels = useSkillLevels(profileId);
  const { enrollments } = useEnrollments(profileId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now] = useState(() => new Date());
  const skills = getSkills().filter((s) => isGeneralSkill(s) || tradeSkillIds.includes(s.id) || levels[s.id] !== undefined);
  const selected = skills.find((s) => s.id === selectedId);

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-3 gap-2 rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-100 p-3" aria-label="Ma ville des compétences">
        {skills.map((skill) => (
          <li key={skill.id}>
            <BuildingTile skill={skill} level={levels[skill.id] ?? null} selected={skill.id === selectedId}
              onSelect={() => setSelectedId(skill.id === selectedId ? null : skill.id)} />
          </li>
        ))}
      </ul>
      {selected
        ? <SkillDetailPanel key={selected.id} skill={selected} profileId={profileId} level={levels[selected.id] ?? null} now={now}
            enrolled={isEnrolled(selected.id, enrollments)} />
        : <p className="text-center text-sm text-slate-500">Touche un bâtiment pour voir ton niveau et tes révisions.</p>}
    </div>
  );
}
