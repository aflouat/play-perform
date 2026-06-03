'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { DbParcours } from '@/lib/db';
import { ParcoursSession } from '@/components/shared/ParcoursSession';
import { useLearningMode } from '@/hooks/useLearningMode';
import { useScore } from '@/hooks/useScore';
import { useActiveProfileId } from '@/hooks/useActiveProfileId';
import { SUBJECT_META } from '@/lib/subjects';
import type { Subject } from '@/types';

const SUBJECT_LABELS: Record<string, string> = {
  maths: 'Maths', francais: 'Français', svt: 'SVT', histoire: 'Histoire',
  physique: 'Physique', anglais: 'Anglais', espagnol: 'Espagnol',
  espace: 'Espace', chimie: 'Chimie', geo: 'Géographie', informatique: 'Informatique',
  mecanique: 'Mécanique', meteo: 'Météo', telecom: 'Télécoms',
};

export default function ParcoursPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const profileId = useActiveProfileId();
  const { mode } = useLearningMode(profileId);
  const { addXp } = useScore(profileId);
  const [parcours, setParcours] = useState<DbParcours | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (profileId === '__none__') { router.replace('/'); return; }
    fetch(`/api/parcours/${id}`)
      .then((r) => r.json() as Promise<{ parcours: DbParcours }>)
      .then((d) => setParcours(d.parcours));
  }, [id, profileId, router]);

  if (!parcours) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;
  }

  if (started) {
    return <ParcoursSession parcours={parcours} mode={mode} addXp={addXp} onDone={() => router.push('/home')} />;
  }

  const totalQ = parcours.subjects.length * parcours.questions_per_subject;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="text-6xl">{parcours.emoji}</div>
        <div>
          <h1 className="text-2xl font-black text-[#1a1a2e]">{parcours.name}</h1>
          {parcours.description && <p className="text-slate-500 text-sm mt-1">{parcours.description}</p>}
        </div>
        <div className="rounded-2xl bg-white shadow-md p-5 text-left space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Ce parcours contient</p>
          {(parcours.subjects as Subject[]).map((s) => (
            <div key={s} className="flex items-center gap-3">
              <span className={`w-8 h-8 rounded-lg ${SUBJECT_META[s]?.bg ?? 'bg-slate-200'} flex items-center justify-center text-base`}>
                {SUBJECT_META[s]?.emoji}
              </span>
              <span className="text-sm font-semibold text-[#1a1a2e]">{SUBJECT_LABELS[s] ?? s}</span>
              <span className="ml-auto text-xs text-slate-400">{parcours.questions_per_subject} questions</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{totalQ} questions au total</span>
            <span className="text-xs font-bold text-amber-500">+{totalQ * 12} XP max</span>
          </div>
        </div>
        <div className="space-y-3">
          <button onClick={() => setStarted(true)}
            className="w-full rounded-2xl bg-violet-600 text-white font-black text-lg px-8 py-4 hover:bg-violet-700 active:scale-[0.98] transition-all shadow-md">
            🚀 Commencer le parcours
          </button>
          <button onClick={() => router.push('/home')}
            className="w-full rounded-2xl bg-slate-100 text-slate-600 font-semibold px-8 py-3 hover:bg-slate-200 transition-colors">
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}
