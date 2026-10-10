'use client';

import { useEffect, useState } from 'react';
import type { TrainingPath } from '../domain/training-path';
import { emptyTrainingPath } from '../domain/training-path-input';
import { fetchTrainingPathCatalog } from '../infra/dashboard-client';
import { saveCatalogPath } from '../infra/training-path-admin-client';
import { TrainingPathForm } from './TrainingPathForm';

type Draft = TrainingPath & { active: boolean };
const NEW = '__new__';

/** Parent company: the catalogue of training paths, and the editor of the selected one (or of a new one). */
export function TrainingPathAdmin() {
  const [paths, setPaths] = useState<Draft[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchTrainingPathCatalog().then((list) => { if (alive) setPaths((list ?? []).map((p) => ({ ...p, active: p.active !== false }))); });
    return () => { alive = false; };
  }, []);

  async function save(path: Draft, isNew: boolean): Promise<string | null> {
    const error = await saveCatalogPath(path, isNew);
    if (error) return error;
    setPaths((all) => (isNew ? [...(all ?? []), path] : (all ?? []).map((p) => (p.id === path.id ? path : p))));
    setSelected(path.id);
    return null;
  }

  if (!paths) return <p className="text-sm text-slate-400">Chargement…</p>;
  const current = selected === NEW ? null : paths.find((p) => p.id === selected);
  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-2" aria-label="Parcours du catalogue">
        {paths.map((p) => (
          <li key={p.id}>
            <button type="button" aria-pressed={selected === p.id} onClick={() => setSelected(p.id)}
              className={`rounded-xl border px-3 py-2 text-sm font-bold ${selected === p.id ? 'border-violet-600 bg-violet-50 text-violet-800' : 'border-slate-200 bg-white text-slate-700'} ${p.active ? '' : 'opacity-60'}`}>
              {p.emoji} {p.name}{p.active ? '' : ' (retiré)'}
            </button>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setSelected(NEW)} className="rounded-xl border border-dashed border-violet-400 px-3 py-2 text-sm font-bold text-violet-700">
            + Nouveau parcours
          </button>
        </li>
      </ul>
      {selected === NEW && <TrainingPathForm key={NEW} initial={emptyTrainingPath()} isNew onSave={(p) => save(p, true)} />}
      {current && <TrainingPathForm key={current.id} initial={current} isNew={false} onSave={(p) => save(p, false)} />}
      {!selected && <p className="text-sm text-slate-500">Choisis un parcours à modifier, ou crée-en un nouveau.</p>}
    </div>
  );
}
