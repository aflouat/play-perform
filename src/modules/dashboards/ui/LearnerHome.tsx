'use client';

import Link from 'next/link';
import { getActiveProfileMeta } from '@/lib/profiles';
import { useLearnerSnapshot } from '../application/useLearnerSnapshot';
import { nextActionsFor } from '../domain/learner';

/** The learner's home: where they are (streak, XP) and what to do now, before the city. */
export function LearnerHome({ profileId }: { profileId: string }) {
  const snapshot = useLearnerSnapshot(profileId);
  const name = getActiveProfileMeta()?.name;
  if (!snapshot) return <p className="text-center text-sm text-slate-400">Chargement…</p>;
  const actions = nextActionsFor(snapshot);

  return (
    <section aria-label="Mon accueil" className="space-y-3 rounded-3xl bg-gradient-to-br from-violet-700 to-fuchsia-600 p-5 text-white shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-black">Salut {name ?? ''} !</h1>
        <p className="flex gap-2 text-xs font-bold">
          <span className="rounded-full bg-white/20 px-2.5 py-1" title="Jours de suite">🔥 {snapshot.streak}</span>
          <span className="rounded-full bg-white/20 px-2.5 py-1">⭐ {snapshot.xp} XP</span>
        </p>
      </div>
      <p className="text-sm text-violet-100">Aujourd’hui</p>
      <ul className="space-y-2">
        {actions.map((a) => (
          <li key={a.id}>
            <Link href={a.href} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#1a1a2e] shadow hover:bg-amber-50">
              <span aria-hidden="true" className="text-xl">{a.icon}</span>
              <span className="flex-1">{a.text}</span>
              <span aria-hidden="true" className="text-violet-500">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
