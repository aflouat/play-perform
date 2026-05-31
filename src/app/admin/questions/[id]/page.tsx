'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import type { DbQuestion } from '@/lib/db';

const SUBJECTS = [
  'maths','francais','svt','histoire','physique','espace','meteo',
  'chimie','mecanique','geo','anglais','espagnol','informatique','telecom',
];

type Params = Promise<{ id: string }>;

function Field({ label, value, onChange, textarea = false }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean;
}) {
  const cls = 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400';
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className={cls} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

export default function EditQuestionPage({ params }: { params: Params }) {
  const { id } = use(params);
  const router = useRouter();
  const [q, setQ] = useState<DbQuestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/questions?subject=`)
      .then((r) => r.json())
      .then((data: { questions: DbQuestion[] }) => {
        const found = data.questions.find((x) => x.id === id);
        if (found) setQ(found);
      });
  }, [id]);

  function set<K extends keyof DbQuestion>(key: K, val: DbQuestion[K]) {
    setQ((prev) => prev ? { ...prev, [key]: val } : prev);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!q) return;
    setSaving(true);
    setMsg(null);
    const key = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ?? '';
    const res = await fetch(`/api/questions/${q.id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify(q),
    });
    setSaving(false);
    if (res.ok) { setMsg('✅ Sauvegardé !'); setTimeout(() => router.push('/admin/questions'), 1200); }
    else setMsg('❌ Erreur lors de la sauvegarde.');
  }

  if (!q) return <div className="text-slate-400 text-sm py-10 text-center">Chargement…</div>;

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-xl font-black text-[#1a1a2e] flex-1">Modifier : <code className="text-violet-600">{q.id}</code></h1>
        <button type="button" onClick={() => router.push('/admin/questions')} className="text-xs text-slate-400 hover:text-slate-600">← Retour</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Matière</label>
          <select value={q.subject} onChange={(e) => set('subject', e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Difficulté (1-4)</label>
          <select value={q.difficulty} onChange={(e) => set('difficulty', parseInt(e.target.value))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
            {[1,2,3,4].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="XP" value={String(q.xp_reward)} onChange={(v) => set('xp_reward', parseInt(v) || 0)} />
        <Field label="Emoji" value={q.emoji ?? ''} onChange={(v) => set('emoji', v)} />
        <Field label="Image URL" value={q.image_url ?? ''} onChange={(v) => set('image_url', v || null)} />
      </div>

      <Field label="Question (advanced)" value={q.question} onChange={(v) => set('question', v)} textarea />
      <Field label="Question assistée" value={q.question_assisted ?? ''} onChange={(v) => set('question_assisted', v || null)} textarea />

      <div className="grid grid-cols-2 gap-3">
        {(['a','b','c','d'] as const).map((l) => (
          <Field key={l} label={`Option ${l.toUpperCase()}`}
            value={(q[`option_${l}` as keyof DbQuestion] as string) ?? ''}
            onChange={(v) => set(`option_${l}` as keyof DbQuestion, v as DbQuestion[keyof DbQuestion])} />
        ))}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 mb-2">Bonne réponse</label>
        <div className="flex gap-3">
          {['A','B','C','D'].map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="correct" value={opt} checked={q.correct_option_id === opt}
                onChange={() => set('correct_option_id', opt)} />
              <span className="text-sm font-bold text-slate-700">{opt}</span>
            </label>
          ))}
        </div>
      </div>

      <Field label="Explication" value={q.explanation} onChange={(v) => set('explanation', v)} textarea />
      <Field label="Explication assistée" value={q.explanation_assisted ?? ''} onChange={(v) => set('explanation_assisted', v || null)} textarea />

      {msg && <p className="text-sm font-semibold">{msg}</p>}

      <button type="submit" disabled={saving}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40 hover:bg-violet-700 transition-colors">
        {saving ? 'Sauvegarde…' : 'Enregistrer'}
      </button>
    </form>
  );
}
