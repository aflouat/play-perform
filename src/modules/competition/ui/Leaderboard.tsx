'use client';

import type { CompetitionView } from '../application/view';
import type { RankMetric } from '../domain/ranking';

const TABS: { id: RankMetric; label: string; unit: string }[] = [
  { id: 'xp', label: 'XP', unit: 'XP' },
  { id: 'streak', label: 'Série', unit: 'jours' },
  { id: 'levels', label: 'Niveaux', unit: 'niv.' },
];

interface Props { board: CompetitionView['board']; metric: RankMetric; onMetric: (metric: RankMetric) => void }

/** Ranking of the centre by pseudonym. */
export function Leaderboard({ board, metric, onMetric }: Props) {
  const unit = TABS.find((t) => t.id === metric)?.unit ?? '';
  return (
    <section aria-label="Classement du centre" className="space-y-3">
      <div role="tablist" className="flex gap-2">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={metric === t.id} onClick={() => onMetric(t.id)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold ${metric === t.id ? 'bg-violet-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{t.label}</button>
        ))}
      </div>
      <ol className="space-y-1.5">
        {board.map((row) => (
          <li key={row.nickname} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${row.isMe ? 'bg-amber-50 ring-2 ring-amber-300' : 'bg-white border border-slate-100'}`}>
            <span className="w-7 text-center font-black text-slate-500">{row.rank}</span>
            <span className="flex-1 font-bold text-[#1a1a2e]">{row.nickname}{row.isMe && ' (moi)'}</span>
            <span className="font-black text-violet-700">{row[metric]} <span className="text-xs font-semibold text-slate-400">{unit}</span></span>
          </li>
        ))}
        {board.length === 0 && <li className="text-sm text-slate-500">Personne au classement pour l’instant.</li>}
      </ol>
    </section>
  );
}
