'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchPendingEnrollments, fetchRecentEnrollments, getSkillById, sendEnrollmentDecision } from '@/modules/skills';

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

function RecentCard({ item, token, onDone }: { item: Pending; token: string; onDone: (id: string) => void }) {
  const [reason, setReason] = useState('');
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skill = getSkillById(item.skillId);

  async function withdraw() {
    setError(null);
    const failure = await sendEnrollmentDecision(token, item.id, 'rejected', reason);
    if (failure) setError(failure); else onDone(item.id);
  }
  return (
    <li className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p><strong>{item.studentName}</strong> · {skill?.emoji} {skill?.name ?? item.skillId} <span className="text-xs text-slate-400">· {new Date(item.createdAt).toLocaleDateString('fr-FR')}</span></p>
        {!asking && <button onClick={() => setAsking(true)} className="text-xs font-bold text-rose-600">Retirer l’accès</button>}
      </div>
      {item.motivation && <p className="rounded-lg bg-slate-50 p-2 text-xs text-slate-600">« {item.motivation} »</p>}
      {asking && (
        <div className="space-y-2">
          <input value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Raison du retrait" placeholder="Raison (visible par l’élève)" className="w-full rounded-lg border border-slate-300 p-2" />
          {error && <p role="alert" className="text-rose-700">{error}</p>}
          <button onClick={withdraw} className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white">Confirmer le retrait</button>
        </div>
      )}
    </li>
  );
}

export default function AdminEnrollmentsPage() {
  const [token, setToken] = useState('');
  const [pending, setPending] = useState<Pending[] | null>(null);
  const [recent, setRecent] = useState<Pending[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    db.auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
      fetchPendingEnrollments(data.session.access_token).then(setPending).catch((e: Error) => setError(e.message));
      fetchRecentEnrollments(data.session.access_token).then(setRecent);
    });
  }, []);

  const removeFrom = useCallback((set: typeof setPending) => (id: string) => set((prev) => (prev ?? []).filter((i) => i.id !== id)), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Inscriptions</h1>
        <p className="mt-0.5 text-xs text-slate-500">Les inscriptions à une formation complète sont validées automatiquement. Les quiz et flashcards restent libres. Tu peux retirer un accès.</p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      <section aria-label="Inscriptions récentes" className="space-y-2">
        <h2 className="text-sm font-black text-[#1a1a2e]">30 derniers jours{recent ? ` (${recent.length})` : ''}</h2>
        {recent?.length === 0 && <p className="text-sm text-slate-500">Aucune inscription récente.</p>}
        <ul className="space-y-2">{recent?.map((item) => <RecentCard key={item.id} item={item} token={token} onDone={removeFrom(setRecent)} />)}</ul>
      </section>

      {pending && pending.length > 0 && (
        <section aria-label="Demandes en attente" className="space-y-2">
          <h2 className="text-sm font-black text-[#1a1a2e]">Anciennes demandes en attente ({pending.length})</h2>
          <ul className="space-y-4">{pending.map((item) => <RequestCard key={item.id} item={item} token={token} onDone={removeFrom(setPending)} />)}</ul>
        </section>
      )}
    </div>
  );
}
