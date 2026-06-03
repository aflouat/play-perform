'use client';

import React, { useState } from 'react';
import { NAV_SUBJECTS } from '@/lib/subjects';
import type { Subject } from '@/types';

const SUBJECT_LABELS: Record<string, string> = {
  maths: 'Maths', francais: 'Français', svt: 'SVT', histoire: 'Histoire',
  physique: 'Physique', anglais: 'Anglais', espagnol: 'Espagnol',
  espace: 'Espace', chimie: 'Chimie', geo: 'Géographie',
  informatique: 'Informatique', mecanique: 'Mécanique', meteo: 'Météo', telecom: 'Télécoms',
};

interface FormData { name: string; emoji: string; description: string; subjects: Subject[]; questionsPerSubject: number }

interface Props {
  initial?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ParcoursForm({ initial, onSubmit, onCancel, submitLabel = 'Créer' }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [emoji, setEmoji] = useState(initial?.emoji ?? '🎯');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [subjects, setSubjects] = useState<Subject[]>(initial?.subjects ?? []);
  const [qps, setQps] = useState(initial?.questionsPerSubject ?? 5);
  const [saving, setSaving] = useState(false);

  function toggleSubject(s: Subject) {
    setSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || subjects.length === 0) return;
    setSaving(true);
    await onSubmit({ name, emoji, description, subjects, questionsPerSubject: qps });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2}
          className="w-16 rounded-xl border border-slate-200 px-3 py-2 text-center text-2xl focus:outline-none focus:border-violet-400" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du parcours…" required
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
      </div>
      <input value={description} onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optionnelle)"
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400" />
      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">Matières incluses :</p>
        <div className="flex flex-wrap gap-2">
          {NAV_SUBJECTS.map((s) => (
            <button type="button" key={s} onClick={() => toggleSubject(s as Subject)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${subjects.includes(s as Subject) ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {SUBJECT_LABELS[s] ?? s}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-slate-500">Questions / matière :</label>
        <input type="number" min={1} max={20} value={qps} onChange={(e) => setQps(Number(e.target.value))}
          className="w-20 rounded-xl border border-slate-200 px-3 py-2 text-sm text-center focus:outline-none focus:border-violet-400" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || !name.trim() || subjects.length === 0}
          className="rounded-xl bg-violet-600 text-white text-sm font-bold px-5 py-2.5 hover:bg-violet-700 disabled:opacity-40 transition-colors">
          {saving ? '…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold px-5 py-2.5 hover:bg-slate-200 transition-colors">
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
