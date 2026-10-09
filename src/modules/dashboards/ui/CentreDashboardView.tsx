'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CentreDashboard, StudentLine } from '../domain/centre';
import { fetchCentreDashboard } from '../infra/dashboard-client';

const STATUS = {
  active: { label: 'Actif cette semaine', dot: 'bg-emerald-500' },
  idle: { label: 'Inactif depuis plus d’une semaine', dot: 'bg-amber-500' },
  dormant: { label: 'Inactif depuis plus d’un mois, ou jamais commencé', dot: 'bg-rose-500' },
} as const;

function Tile({ value, label, href, alert }: { value: string | number; label: string; href?: string; alert?: boolean }) {
  const body = (
    <div className={`rounded-2xl border p-4 text-center ${alert ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-2xl font-black text-[#1a1a2e]">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
  return href ? <Link href={href} className="block hover:opacity-90">{body}</Link> : body;
}

function Line({ s }: { s: StudentLine }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS[s.status].dot}`} role="img" aria-label={STATUS[s.status].label} />
      <span aria-hidden="true">{s.emoji}</span>
      <span className="flex-1 font-bold text-[#1a1a2e]">{s.name} <span className="font-normal text-slate-400">· {s.grade}</span></span>
      <span className="text-xs text-slate-500">{s.skillsStarted} cours · niv. {s.levelsTotal} · {s.xp} XP{s.streak > 0 ? ` · 🔥${s.streak}` : ''}</span>
    </li>
  );
}

/** What a centre needs on arrival: who works, who needs a nudge, what waits for a decision. */
export function CentreDashboardView() {
  const [dash, setDash] = useState<CentreDashboard | null | undefined>(undefined);
  useEffect(() => { fetchCentreDashboard().then(setDash); }, []);
  if (dash === undefined) return <p className="text-center text-sm text-slate-400">Chargement du tableau de bord…</p>;
  if (dash === null) return null;

  return (
    <section aria-label="Tableau de bord du centre" className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile value={dash.totalStudents} label="Élèves" />
        <Tile value={`${dash.activeThisWeek}/${dash.totalStudents}`} label="Actifs cette semaine" />
        <Tile value={dash.pendingEnrollments} label="Demandes d’inscription" href="/admin/inscriptions" alert={dash.pendingEnrollments > 0} />
        <Tile value={dash.pendingEvaluations} label="Évaluations à corriger" href="/admin/evaluations" alert={dash.pendingEvaluations > 0} />
      </div>
      <p className="text-xs text-slate-500">
        {dash.challengePlayers} élève{dash.challengePlayers > 1 ? 's ont' : ' a'} relevé le défi de la semaine · {dash.averageLevels.toFixed(1)} niveau{dash.averageLevels >= 2 ? 'x' : ''} gagné{dash.averageLevels >= 2 ? 's' : ''} en moyenne par élève
      </p>
      {dash.needAttention.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-black text-[#1a1a2e]">À relancer ({dash.needAttention.length})</h2>
          <ul className="space-y-1.5">{dash.needAttention.map((s) => <Line key={s.id} s={s} />)}</ul>
        </div>
      )}
      {dash.totalStudents > 0 && dash.needAttention.length === 0 && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Tous tes élèves ont travaillé cette semaine 🎉</p>}
      {dash.totalStudents === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Aucun élève pour l’instant : ajoute le premier ci-dessous pour lui remettre son code d’accès.</p>}
    </section>
  );
}
