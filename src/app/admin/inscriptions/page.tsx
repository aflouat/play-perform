'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchPendingEnrollments, getSkillById, sendEnrollmentDecision } from '@/modules/skills';

type Pending = Awaited<ReturnType<typeof fetchPendingEnrollments>>[number];

function RequestCard({ item, token, onDone }: { item: Pending; token: string; onDone: (id: string) => void }) {
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const skill = getSkillById(item.skillId);

  async function decide(status: 'approved' | 'rejected') {
    setError(null);
    const failure = await sendEnrollmentDecision(token, item.id, status, comment);
    if (failure) setError(failure); else onDone(item.id);
  }

  return (
    <li className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold text-slate-400">{item.studentName} · {skill?.emoji} {skill?.name ?? item.skillId}</p>
      <p className="text-xs font-semibold text-slate-500">Motivations de l&apos;apprenant</p>
      <blockquote className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-700">{item.motivation}</blockquote>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} aria-label="Commentaire"
        placeholder="Message pour l’apprenant (obligatoire pour refuser)" className="w-full rounded-xl border border-slate-300 p-2 text-sm" />
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <div className="flex gap-3">
        <button onClick={() => decide('rejected')} className="flex-1 rounded-xl bg-amber-100 py-2 font-bold text-amber-800">↩️ Refuser</button>
        <button onClick={() => decide('approved')} className="flex-1 rounded-xl bg-emerald-500 py-2 font-bold text-white">✅ Accepter</button>
      </div>
    </li>
  );
}

export default function AdminEnrollmentsPage() {
  const [token, setToken] = useState('');
  const [items, setItems] = useState<Pending[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    db.auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
      fetchPendingEnrollments(data.session.access_token).then(setItems).catch((e: Error) => setError(e.message));
    });
  }, []);

  const remove = useCallback((id: string) => setItems((prev) => (prev ?? []).filter((i) => i.id !== id)), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Demandes d&apos;inscription</h1>
        <p className="mt-0.5 text-xs text-slate-500">Un apprenant ne peut travailler un cours qu&apos;une fois sa demande acceptée par le centre de formation.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      {items?.length === 0 && <p className="text-sm text-slate-500">Aucune demande en attente. 🎉</p>}
      <ul className="space-y-4">{items?.map((item) => <RequestCard key={item.id} item={item} token={token} onDone={remove} />)}</ul>
    </div>
  );
}
