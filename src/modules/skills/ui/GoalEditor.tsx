'use client';

import { useState } from 'react';
import { getSkillGoal, setSkillGoal } from '../application/skill-goals';
import { paceToGoal } from '../domain/dashboard';
import type { SkillLevelNumber } from '../domain/skill';

interface Props { profileId: string; skillId: string; level: SkillLevelNumber | null; now: Date }

const MESSAGE = {
  'no-goal': 'Fixe une date pour savoir à quel rythme avancer.',
  achieved: '🏆 Objectif atteint, bravo !',
  'on-track': 'Dans les temps',
  late: '⚠️ Date trop proche : repousse-la ou accélère.',
} as const;

/** Target date to reach mastery (level 5) and the pace it requires. */
export function GoalEditor({ profileId, skillId, level, now }: Props) {
  const [goal, setGoal] = useState<string | null>(() => getSkillGoal(profileId, skillId));
  const pace = paceToGoal(level, goal, now);

  function change(value: string) {
    const next = value || null;
    setGoal(next);
    setSkillGoal(profileId, skillId, next);
  }

  return (
    <div className="space-y-1.5 text-xs">
      <label htmlFor={`goal-${skillId}`} className="font-bold text-slate-600">🎯 Objectif : maîtriser cette compétence pour le</label>
      <input id={`goal-${skillId}`} type="date" value={goal ?? ''} onChange={(e) => change(e.target.value)}
        className="block w-full rounded-lg border border-slate-300 p-2" />
      <p className={pace.status === 'late' ? 'font-bold text-rose-700' : 'text-slate-500'}>
        {MESSAGE[pace.status]}
        {pace.status === 'on-track' && pace.daysPerLevel !== null && <> · {pace.levelsLeft} niveau{pace.levelsLeft > 1 ? 'x' : ''} à gagner, soit un tous les {pace.daysPerLevel} jours</>}
      </p>
    </div>
  );
}
