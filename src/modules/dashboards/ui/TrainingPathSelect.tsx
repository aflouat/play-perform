'use client';

import { useEffect, useState } from 'react';
import { useTrainingPathCatalog } from '../application/useTrainingPathCatalog';
import { fetchTrainingPath, saveTrainingPath } from '../infra/dashboard-client';

/** The centre assigns (or changes) a student's training path: it decides the chapters of their roadmap. */
export function TrainingPathSelect({ studentId }: { studentId: string }) {
  const [pathId, setPathId] = useState<string | null | undefined>(undefined);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const { paths } = useTrainingPathCatalog();
  // The student's current path stays listed even once it is no longer offered
  const options = paths.filter((p) => p.active !== false || p.id === pathId);

  useEffect(() => {
    let alive = true;
    fetchTrainingPath(studentId).then((stored) => { if (alive) setPathId(stored ?? null); });
    return () => { alive = false; };
  }, [studentId]);

  async function change(next: string) {
    const value = next || null;
    const error = await saveTrainingPath(studentId, value);
    if (error) { setMessage({ ok: false, text: error }); return; }
    setPathId(value);
    setMessage({ ok: true, text: value ? 'Parcours enregistré : sa carte suit maintenant ce parcours.' : 'Parcours retiré : l’élève choisira le sien.' });
  }

  if (pathId === undefined) return null;
  return (
    <div className="space-y-1 rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <label className="flex items-center gap-2 text-slate-500">
        🗺️ Parcours
        <select value={pathId ?? ''} onChange={(e) => change(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-700">
          <option value="">Au choix de l’élève</option>
          {options.map((p) => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
        </select>
      </label>
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-emerald-700' : 'text-rose-700'}>{message.text}</p>}
    </div>
  );
}
