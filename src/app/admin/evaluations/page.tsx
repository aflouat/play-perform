'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchPendingEvaluations, getSkillById, sendCorrection } from '@/modules/skills';

type Pending = Awaited<ReturnType<typeof fetchPendingEvaluations>>[number];

function EvaluationCard({ item, token, onDone }: { item: Pending; token: string; onDone: (id: string) => void }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const skill = getSkillById(item.skillId);

  async function decide(status: 'passed' | 'failed') {
    setError(null);
    const failure = await sendCorrection(token, item.id, status, comment);
    if (failure) setError(failure); else onDone(item.id);
  }

  return (
    <li className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold text-slate-400">{item.studentName} · {skill?.emoji} {skill?.name ?? item.skillId} · niveau {item.level}</p>
      <p className="font-bold text-[#1a1a2e]">{item.prompt}</p>
      <blockquote className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{item.answer}</blockquote>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Commentaire pour l’élève (obligatoire pour refuser)"
        aria-label="Commentaire" className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <div className="flex gap-3">
        <button onClick={() => decide('failed')} className="flex-1 rounded-xl bg-amber-100 py-2 font-bold text-amber-800">↩️ À reprendre</button>
        <button onClick={() => decide('passed')} className="flex-1 rounded-xl bg-emerald-500 py-2 font-bold text-white">✅ Valider (+1 niveau)</button>
      </div>
    </li>
  );
}

export default function AdminEvaluationsPage() {
  const [token, setToken] = useState('');
  const [items, setItems] = useState<Pending[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    db.auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
      fetchPendingEvaluations(data.session.access_token).then(setItems).catch((e: Error) => setError(e.message));
    });
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => (prev ?? []).filter((i) => i.id !== id)), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Évaluations à corriger</h1>
        <p className="mt-0.5 text-xs text-slate-500">Réponses rédigées par les élèves. Valider fait monter le niveau de la compétence.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      {items?.length === 0 && <p className="text-sm text-slate-500">Rien à corriger pour le moment. 🎉</p>}
      <ul className="space-y-4">{items?.map((item) => <EvaluationCard key={item.id} item={item} token={token} onDone={remove} />)}</ul>
    </div>
  );
}
