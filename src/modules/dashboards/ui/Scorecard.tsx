'use client';

import { useMemo } from 'react';
import { initScore, loadFromStorage } from '@/lib/score-storage';
import { latestBadges, rankProgress } from '../domain/scorecard';

/** Status and motivation: streak, progress towards the next rank, latest badges. */
export function Scorecard({ profileId }: { profileId: string }) {
  // Client only (the command center shows once the profile is read from the device)
  const score = useMemo(() => loadFromStorage(profileId) ?? initScore(profileId), [profileId]);
  const rank = rankProgress(score.xp);
  const badges = latestBadges(score.badges);

  return (
    <section aria-label="Mon statut" className="space-y-4 rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`text-4xl ${score.streak > 0 ? '' : 'grayscale'}`}>🔥</span>
        <p>
          <span className="block text-3xl font-black text-orange-500">{score.streak}</span>
          <span className="text-xs font-semibold text-slate-500">jour{score.streak > 1 ? 's' : ''} de suite</span>
        </p>
      </div>
      <div>
        <p className="flex justify-between text-xs font-bold text-slate-600">
          <span>Rang {rank.rank}</span>
          <span>{rank.xpInRank} / {rank.xpPerRank} XP</span>
        </p>
        <div role="progressbar" aria-label={`Vers le rang ${rank.rank + 1}`} aria-valuemin={0} aria-valuemax={rank.xpPerRank} aria-valuenow={rank.xpInRank}
          className="mt-1 h-3 overflow-hidden rounded-full bg-violet-100">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" style={{ width: `${rank.percent}%` }} />
        </div>
        <p className="mt-1 text-[11px] text-slate-400">⭐ {score.xp} XP au total</p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-600">Derniers badges</p>
        {badges.length === 0
          ? <p className="mt-1 text-xs text-slate-400">Ton premier quiz t’en rapporte un !</p>
          : (
            <ul className="mt-1 flex gap-2">
              {badges.map((b) => (
                <li key={b.id} title={`${b.name} : ${b.description}`} className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-2xl">
                  <span role="img" aria-label={b.name}>{b.emoji}</span>
                </li>
              ))}
            </ul>
          )}
      </div>
    </section>
  );
}
