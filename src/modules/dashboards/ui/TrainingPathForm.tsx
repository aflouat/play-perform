'use client';

import { useState } from 'react';
import { GENERIC_PHASES, type TrainingPath } from '../domain/training-path';
import { slugify } from '../domain/training-path-input';
import { PhaseEditor } from './PhaseEditor';

type Draft = TrainingPath & { active: boolean };
const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm';

interface Props { initial: Draft; isNew: boolean; onSave: (path: Draft) => Promise<string | null> }

/** Editor of one training path: name, identifier, description, availability, then its chapters in the 4 generic phases. */
export function TrainingPathForm({ initial, isNew, onSave }: Props) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [idTouched, setIdTouched] = useState(!isNew);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  async function save() {
    setBusy(true);
    const error = await onSave(draft);
    setBusy(false);
    setMessage(error ? { ok: false, text: error } : { ok: true, text: 'Parcours enregistré : les cartes des élèves concernés sont à jour.' });
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_6rem]">
        <label className="text-sm text-slate-600">Nom du parcours
          <input value={draft.name} required className={input} placeholder="ex. Technicien Pharma"
            onChange={(e) => set({ name: e.target.value, ...(idTouched ? {} : { id: slugify(e.target.value) }) })} />
        </label>
        <label className="text-sm text-slate-600">Emoji
          <input value={draft.emoji} onChange={(e) => set({ emoji: e.target.value })} className={input} />
        </label>
        <label className="text-sm text-slate-600 sm:col-span-2">Identifiant {isNew ? '(définitif une fois créé)' : ''}
          <input value={draft.id} disabled={!isNew} className={`${input} font-mono disabled:bg-slate-50`}
            onChange={(e) => { setIdTouched(true); set({ id: e.target.value }); }} />
        </label>
        <label className="text-sm text-slate-600 sm:col-span-2">Description (vue par l’élève qui choisit)
          <input value={draft.description} maxLength={200} onChange={(e) => set({ description: e.target.value })} className={input} />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
          <input type="checkbox" checked={draft.active} onChange={(e) => set({ active: e.target.checked })} />
          Proposé aux élèves et aux centres (décoché : les élèves qui le suivent le gardent)
        </label>
      </div>
      {GENERIC_PHASES.map((p, i) => (
        <PhaseEditor key={p.id} number={i + 1} title={p.title} phase={draft.phases[p.id]}
          onChange={(phase) => set({ phases: { ...draft.phases, [p.id]: phase } })} />
      ))}
      <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-slate-50 py-3">
        <button type="submit" disabled={busy} className="rounded-xl bg-violet-600 px-5 py-2 font-bold text-white disabled:opacity-60">
          {isNew ? 'Créer le parcours' : 'Enregistrer'}
        </button>
        {message && <p role={message.ok ? 'status' : 'alert'} className={`text-sm ${message.ok ? 'text-emerald-700' : 'text-rose-700'}`}>{message.text}</p>}
      </div>
    </form>
  );
}
