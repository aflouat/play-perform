'use client';

import { useState } from 'react';
import { GENERIC_PHASES } from '../domain/training-path';
import { getTrainingPaths } from '../infra/training-paths-seed';

/** No training path yet: the learner picks one (afterwards only the centre changes it). */
export function TrainingPathPicker({ onChoose }: { onChoose: (pathId: string) => Promise<string | null> }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(pathId: string) {
    setBusy(true);
    setError(await onChoose(pathId));
    setBusy(false);
  }

  return (
    <section aria-label="Choisir mon parcours" className="space-y-3 rounded-3xl bg-white p-5 shadow-sm">
      <h2 className="font-black text-[#1a1a2e]">🗺️ Choisis ton parcours de formation</h2>
      <p className="text-sm text-slate-500">
        Ta carte suit {GENERIC_PHASES.length} phases ({GENERIC_PHASES.map((p) => p.title).join(' → ')}) ; leurs chapitres dépendent de ton parcours. Ton centre peut aussi le choisir pour toi.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {getTrainingPaths().map((p) => (
          <li key={p.id}>
            <button type="button" disabled={busy} onClick={() => pick(p.id)}
              className="h-full w-full rounded-2xl border-2 border-violet-100 p-4 text-left hover:border-violet-500 disabled:opacity-60">
              <span aria-hidden="true" className="text-3xl">{p.emoji}</span>
              <span className="mt-1 block font-black text-[#1a1a2e]">{p.name}</span>
              <span className="block text-xs text-slate-500">{p.description}</span>
            </button>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    </section>
  );
}
