'use client';

import { useCallback, useEffect, useState } from 'react';
import type { LearningMode } from '@/lib/learning-mode';
import { getSkillById } from '@/modules/skills';
import { challengeFor } from '../application/challenge';
import type { CompetitionView } from '../application/view';
import type { RankMetric } from '../domain/ranking';
import { isoWeek } from '../domain/week';
import { fetchCompetition } from '../infra/competition-client';
import { ChallengePlayer } from './ChallengePlayer';
import { Leaderboard } from './Leaderboard';

/** Learner's competition screen: weekly challenge, its board, my medals and the centre ranking. */
export function CompetitionPanel({ profileId, mode }: { profileId: string; mode: LearningMode }) {
  const [metric, setMetric] = useState<RankMetric>('xp');
  const [view, setView] = useState<CompetitionView | null>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback((m: RankMetric) => {
    fetchCompetition(profileId, m).then((v) => { setView(v); setUnavailable(v === null); });
  }, [profileId]);
  useEffect(() => load(metric), [load, metric]);

  if (unavailable) return <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Le classement n’est pas disponible pour ce profil (connecte-toi avec ton code d’accès).</p>;
  if (!view) return <p className="text-center text-sm text-slate-400">Chargement…</p>;

  const challenge = challengeFor(isoWeek(new Date()));
  const skill = getSkillById(challenge.skillId);
  return (
    <div className="space-y-6">
      <section aria-label="Défi de la semaine" className="space-y-3 rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5 text-white">
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">Défi de la semaine · {view.week}</p>
        <h2 className="text-lg font-black">{skill?.emoji} {skill?.name}</h2>
        {view.myResult ? <p className="font-bold">Ton score : {view.myResult.correct}/{view.myResult.total}. Reviens lundi pour le prochain défi !</p>
          : playing ? null
          : <button onClick={() => setPlaying(true)} className="w-full rounded-2xl bg-white py-3 font-black text-violet-700">Relever le défi (5 questions, une seule fois)</button>}
      </section>

      {playing && !view.myResult && (
        <ChallengePlayer profileId={profileId} challenge={challenge} mode={mode} onDone={() => { setPlaying(false); load(metric); }} />
      )}

      {view.weekly.length > 0 && (
        <section aria-label="Classement du défi">
          <h2 className="mb-2 font-black text-[#1a1a2e]">Classement du défi</h2>
          <ol className="space-y-1.5 text-sm">
            {view.weekly.map((r) => (
              <li key={r.nickname} className={`flex items-center gap-3 rounded-xl px-3 py-2 ${r.isMe ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-white border border-slate-100'}`}>
                <span className="w-7 text-center font-black text-slate-500">{r.rank}</span>
                <span className="flex-1 font-bold">{r.nickname}</span>
                <span className="font-black text-violet-700">{r.correct}/{r.total}</span>
                <span className="text-xs text-slate-400">{Math.round(r.durationMs / 1000)} s</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {(view.myTrophies.length > 0 || view.pastAwards.length > 0) && (
        <section aria-label="Médailles">
          <h2 className="mb-2 font-black text-[#1a1a2e]">Médailles</h2>
          {view.myTrophies.length > 0 && <p className="mb-2 text-sm font-bold text-amber-700">Tes médailles : {view.myTrophies.map((t) => `${t.medal} ${t.week}`).join(' · ')}</p>}
          <ul className="space-y-1 text-xs text-slate-600">
            {view.pastAwards.map((p) => <li key={p.week}><strong>{p.week}</strong> : {p.awards.map((a) => `${a.medal} ${a.nickname}`).join(' · ')}</li>)}
          </ul>
        </section>
      )}

      <Leaderboard board={view.board} metric={metric} onMetric={setMetric} />
    </div>
  );
}
