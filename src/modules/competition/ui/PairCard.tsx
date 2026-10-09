'use client';

import { useCallback, useEffect, useState } from 'react';
import { MENTION_MIN_CORRECT } from '../domain/bonus';
import type { PairView } from '../application/pair-view';
import { claimPairBonus, fetchPair } from '../infra/competition-client';

/** The pair of the week: "if you both get the mention, you both win the bonus". Changes every week. */
export function PairCard({ profileId, onBonus }: { profileId: string; onBonus: (xp: number) => void }) {
  const [pair, setPair] = useState<PairView | null | undefined>(undefined);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(() => { fetchPair(profileId).then(setPair); }, [profileId]);
  useEffect(load, [load]);

  async function claim() {
    const result = await claimPairBonus(profileId);
    if ('error' in result) { setMessage(result.error); return; }
    onBonus(result.xp);
    setMessage(`+${result.xp} XP pour vous deux, bravo l’équipe ! 🎉`);
    load();
  }

  if (!pair) return pair === null ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Pas encore de binôme : il faut au moins un autre élève dans ton centre.</p> : null;
  const names = pair.partners.map((p) => p.nickname).join(' et ');
  return (
    <section aria-label="Mon binôme" className="space-y-3 rounded-3xl bg-gradient-to-br from-sky-600 to-indigo-600 p-5 text-white">
      <p className="text-xs font-bold uppercase tracking-wide opacity-80">Binôme de la semaine · {pair.week}</p>
      <h2 className="text-lg font-black">🤝 Avec {names}</h2>
      <p className="text-sm text-sky-100">Le contrat : si vous obtenez <strong>tous les deux la mention</strong> ({MENTION_MIN_CORRECT} bonnes réponses sur 5 au défi de la semaine), vous gagnez <strong>tous les deux +{pair.bonusXp} XP</strong>. Aidez-vous !</p>
      <ul className="space-y-1 text-sm">
        <li>Toi : {pair.me.mention ? '✅ mention obtenue' : pair.me.played ? '⏳ pas encore la mention' : '🎯 défi à relever'}</li>
        {pair.partners.map((p) => <li key={p.nickname}>{p.nickname} : {p.mention ? '✅ mention obtenue' : p.played ? '⏳ pas encore la mention' : '🎯 pas encore joué — un petit message d’encouragement ?'}</li>)}
      </ul>
      {pair.claimable && <button onClick={claim} className="w-full rounded-2xl bg-amber-400 py-3 font-black text-violet-950">🎁 Récupérer le bonus (+{pair.bonusXp} XP)</button>}
      {pair.claimed && <p role="status" className="rounded-xl bg-white/20 p-2 text-center text-sm font-bold">Bonus récupéré cette semaine ✅</p>}
      {message && <p role="status" className="text-sm font-bold">{message}</p>}
    </section>
  );
}
