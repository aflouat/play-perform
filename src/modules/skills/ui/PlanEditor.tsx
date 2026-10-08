'use client';

import { useState } from 'react';
import { getSkillPlan, setSkillPlan } from '../application/skill-plans';
import { reminderPermission, requestReminderPermission, type ReminderPermission } from '../application/reminders';
import { dailyMinutesNeeded, victoryDate, type StudyPlan } from '../domain/effort';
import { remainingMinutes } from '../domain/effort';
import type { SkillLevelNumber } from '../domain/skill';

interface Props { profileId: string; skillId: string; level: SkillLevelNumber | null; now: Date }

const formatDay = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
const INPUT = 'block w-full rounded-lg border border-slate-300 p-2';

/** Daily effort, goal date and reminder time for one skill, with the resulting forecast. */
export function PlanEditor({ profileId, skillId, level, now }: Props) {
  const [plan, setPlan] = useState<StudyPlan>(() => getSkillPlan(profileId, skillId));
  const [permission, setPermission] = useState<ReminderPermission>(() => reminderPermission());
  const needed = dailyMinutesNeeded(level, plan.goalDate, now);
  const victory = victoryDate(level, plan.dailyMinutes, now);

  function update(patch: Partial<StudyPlan>) {
    const next = { ...plan, ...patch };
    setPlan(next);
    setSkillPlan(profileId, skillId, next);
  }
  async function enableReminders() { setPermission(await requestReminderPermission()); }

  if (remainingMinutes(level) === 0) return <p className="text-sm font-bold text-emerald-700">🏆 Victoire : tu maîtrises cette compétence !</p>;

  return (
    <div className="space-y-3 text-xs">
      <p className="font-bold text-slate-600">🎯 Mon plan jusqu&apos;à la victoire <span className="font-normal text-slate-400">(≈ {Math.round(remainingMinutes(level) / 60)} h restantes)</span></p>
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-slate-600">Effort par jour (min)
          <input type="number" min={5} max={240} step={5} value={plan.dailyMinutes ?? ''} className={INPUT}
            onChange={(e) => update({ dailyMinutes: e.target.value ? Number(e.target.value) : null })} />
        </label>
        <label className="space-y-1 text-slate-600">Rappel quotidien à
          <input type="time" value={plan.reminderTime ?? ''} className={INPUT} onChange={(e) => update({ reminderTime: e.target.value || null })} />
        </label>
      </div>
      <label className="block space-y-1 text-slate-600">Victoire souhaitée pour le
        <input type="date" value={plan.goalDate ?? ''} className={INPUT} onChange={(e) => update({ goalDate: e.target.value || null })} />
      </label>
      <p className="rounded-lg bg-violet-50 p-2 text-violet-800">
        {victory && plan.dailyMinutes ? `À ${plan.dailyMinutes} min par jour, victoire le ${formatDay(victory)}.` : 'Choisis un effort quotidien pour voir ta date de victoire.'}
        {needed !== null && <> Pour tenir ta date : <strong>{needed} min par jour</strong>.</>}
        {plan.goalDate && needed === null && ' Cette date est déjà passée : choisis-en une nouvelle.'}
      </p>
      {plan.reminderTime && permission !== 'granted' && (
        <button onClick={enableReminders} disabled={permission === 'unsupported' || permission === 'denied'}
          className="w-full rounded-lg bg-slate-800 py-2 font-bold text-white disabled:opacity-40">
          {permission === 'denied' ? 'Notifications bloquées dans le navigateur' : permission === 'unsupported' ? 'Notifications non disponibles ici' : '🔔 Activer les rappels'}
        </button>
      )}
      {plan.reminderTime && permission === 'granted' && <p className="text-emerald-700">🔔 Rappel actif à {plan.reminderTime} (l&apos;application doit être ouverte).</p>}
    </div>
  );
}
