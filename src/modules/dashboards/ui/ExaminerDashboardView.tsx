'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { ExaminerDashboard } from '../domain/examiner';
import { fetchExaminerDashboard } from '../infra/dashboard-client';

/** The examiner's queue: what waits, for how long, and how fast corrections go. */
export function ExaminerDashboardView() {
  const [dash, setDash] = useState<ExaminerDashboard | null | undefined>(undefined);
  useEffect(() => { fetchExaminerDashboard().then(setDash); }, []);
  if (dash === undefined) return <p className="text-center text-sm text-slate-400">Chargement…</p>;
  if (dash === null) return <p role="alert" className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Ce tableau de bord est réservé aux examinateurs d’un centre.</p>;

  return (
    <section aria-label="Tableau de bord de l’examinateur" className="space-y-4">
      <div className={`rounded-2xl p-5 text-center ${dash.pending > 0 ? 'bg-amber-50 border border-amber-300' : 'bg-emerald-50 border border-emerald-200'}`}>
        <p className="text-4xl font-black text-[#1a1a2e]">{dash.pending}</p>
        <p className="text-sm font-semibold text-slate-600">évaluation{dash.pending > 1 ? 's' : ''} à corriger</p>
        {dash.pending > 0
          ? <Link href="/admin/evaluations" className="mt-3 inline-block rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-bold text-white">Commencer les corrections →</Link>
          : <p className="mt-2 text-sm font-semibold text-emerald-800">Rien en attente 🎉</p>}
      </div>
      <dl className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-white p-3 shadow-sm"><dd className="text-xl font-black">{dash.oldestWaitingDays} j</dd><dt className="text-xs text-slate-500">attente la plus longue</dt></div>
        <div className="rounded-xl bg-white p-3 shadow-sm"><dd className="text-xl font-black">{dash.correctedThisWeek}</dd><dt className="text-xs text-slate-500">corrigées cette semaine</dt></div>
        <div className="rounded-xl bg-white p-3 shadow-sm"><dd className="text-xl font-black">{dash.averageTurnaroundHours === null ? '—' : `${Math.round(dash.averageTurnaroundHours)} h`}</dd><dt className="text-xs text-slate-500">délai moyen</dt></div>
      </dl>
      {dash.byCentre.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-black text-[#1a1a2e]">Par centre</h2>
          <ul className="space-y-1.5">
            {dash.byCentre.map((c) => <li key={c.organizationName} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm shadow-sm"><span>🏫 {c.organizationName}</span><strong>{c.pending}</strong></li>)}
          </ul>
        </div>
      )}
    </section>
  );
}
