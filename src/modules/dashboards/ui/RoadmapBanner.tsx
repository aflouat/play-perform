'use client';

import { useState } from 'react';
import type { PhaseView } from '../domain/roadmap';
import { PhaseDetail } from './PhaseDetail';

const STATUS_TEXT = { done: 'accomplie', current: 'en cours', locked: 'à venir, verrouillée' } as const;

function PhaseCircle({ phase }: { phase: PhaseView }) {
  if (phase.status === 'done') {
    return <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-xl font-black text-white shadow">✓</span>;
  }
  if (phase.status === 'locked') {
    return <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg opacity-60" aria-hidden="true">🔒</span>;
  }
  return (
    <span className="relative flex h-12 w-12 items-center justify-center">
      <span className="absolute inset-0 rounded-full bg-violet-400 opacity-60 motion-safe:animate-ping" aria-hidden="true" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white shadow-lg ring-4 ring-violet-200">
        {phase.done}/{phase.total}
      </span>
    </span>
  );
}

/** The "treasure map": numbered phases on a line (done ✓, current pulsing, locked 🔒); a click opens the phase's detail below. */
export function RoadmapBanner({ phases }: { phases: PhaseView[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = phases.find((p) => p.id === openId && p.status !== 'locked');

  return (
    <section aria-label="Ma feuille de route" className="rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-black text-[#1a1a2e]">🗺️ Ma carte au trésor</h2>
      <ol className="mt-4 flex items-start">
        {phases.map((phase, i) => (
          <li key={phase.id} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span aria-hidden="true" className={`absolute right-1/2 top-6 h-1 w-full -translate-y-1/2 ${phase.status === 'locked' ? 'bg-slate-200' : 'bg-emerald-400'}`} />
            )}
            <button
              type="button" disabled={phase.status === 'locked'} aria-expanded={openId === phase.id}
              aria-label={`Phase ${phase.number} : ${phase.title}, ${STATUS_TEXT[phase.status]}${phase.status === 'current' ? `, ${phase.done} cours sur ${phase.total}` : ''}`}
              onClick={() => setOpenId(openId === phase.id ? null : phase.id)}
              className="relative z-10 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-not-allowed"
            >
              <PhaseCircle phase={phase} />
            </button>
            <span className={`mt-2 text-xs font-bold ${phase.status === 'locked' ? 'text-slate-400' : 'text-[#1a1a2e]'}`}>Phase {phase.number}</span>
            <span className="hidden text-[11px] text-slate-500 sm:block">{phase.title}</span>
          </li>
        ))}
      </ol>
      {open && <PhaseDetail phase={open} />}
    </section>
  );
}
