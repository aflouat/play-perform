'use client';

import { useState } from 'react';
import { getSkills } from '../infra/skills-repository';
import { useSkillLevels } from '../application/skill-progress';
import { BuildingTile } from './BuildingTile';
import { SkillDetailPanel } from './SkillDetailPanel';

/** The learner's town: one building per skill of their programme; click one to see its level, reviews and goal. */
export function SkillMap({ profileId }: { profileId: string }) {
  const levels = useSkillLevels(profileId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [now] = useState(() => new Date());
  const selected = getSkills().find((s) => s.id === selectedId);

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-3 gap-2 rounded-3xl bg-gradient-to-b from-sky-100 to-emerald-100 p-3" aria-label="Ma ville des compétences">
        {getSkills().map((skill) => (
          <li key={skill.id}>
            <BuildingTile skill={skill} level={levels[skill.id] ?? null} selected={skill.id === selectedId}
              onSelect={() => setSelectedId(skill.id === selectedId ? null : skill.id)} />
          </li>
        ))}
      </ul>
      {selected
        ? <SkillDetailPanel key={selected.id} skill={selected} profileId={profileId} level={levels[selected.id] ?? null} now={now} />
        : <p className="text-center text-sm text-slate-500">Touche un bâtiment pour voir ton niveau et tes révisions.</p>}
    </div>
  );
}
