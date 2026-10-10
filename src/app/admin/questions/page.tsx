'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-fetch';
import type { DbQuestion } from '@/lib/db';
import { NAV_SUBJECTS } from '@/lib/subjects';

const SUBJECTS = NAV_SUBJECTS;
const DIFF_LABEL: Record<number, string> = { 1: '🌱', 2: '📖', 3: '⚡', 4: '🔥' };

export default function AdminQuestionsPage() {
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const url = subject ? `/api/questions?subject=${subject}` : '/api/questions';
    adminFetch(url)
      .then((res) => res.json() as Promise<{ questions: DbQuestion[] }>)
      .then((data) => { if (active) { setQuestions(data.questions ?? []); setLoading(false); } })
      .catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [subject, seedMsg]);

  async function handleSeed() {
    setSeedMsg('Copie en cours…');
    const res = await adminFetch('/api/questions/seed', { method: 'POST' });
    const d = await res.json() as { total?: number; added?: number; error?: string };
    setSeedMsg(res.ok ? `${d.added} question(s) ajoutée(s) sur ${d.total} intégrées.` : (d.error ?? 'Erreur'));
  }

  async function handleDelete(id: string) {
    if (!window.confirm(`Supprimer "${id}" ?`)) return;
    setDeleting(id);
    await adminFetch(`/api/questions/${id}`, { method: 'DELETE' });
    setQuestions((q) => q.filter((x) => x.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1a1a2e]">Banque de questions</h1>
          <p className="text-slate-400 text-xs mt-0.5">Les questions publiées ici remplacent celles du code (même identifiant) ou s&apos;y ajoutent.</p>
        </div>
        <span className="flex gap-2">
          <button onClick={handleSeed} className="rounded-xl border border-violet-200 text-violet-700 text-sm font-bold px-4 py-2 hover:bg-violet-50">
            Copier les banques intégrées
          </button>
          <Link href="/admin/import" className="rounded-xl bg-violet-600 text-white text-sm font-bold px-4 py-2 hover:bg-violet-700 transition-colors">
            + Importer
          </Link>
        </span>
      </div>

      <div className="flex gap-3 items-center">
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
          <option value="">Toutes les matières</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-400 text-sm">{questions.length} question(s)</span>
        {seedMsg && <span className="text-xs text-violet-600">{seedMsg}</span>}
        {loading && <span className="text-xs text-slate-400 animate-pulse">Chargement…</span>}
      </div>

      {questions.length === 0 && !loading && (
        <div className="rounded-2xl bg-white border border-slate-100 p-8 text-center text-slate-400 text-sm">
          Aucune question importée. <Link href="/admin/import" className="text-violet-600 underline">Importer →</Link>
        </div>
      )}

      <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
        {questions.length > 0 && (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Diff.</th>
                <th className="px-4 py-3 text-left">Matière / compétence</th>
                <th className="px-4 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-left">Rép.</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-lg">{DIFF_LABEL[q.difficulty] ?? q.difficulty}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">{q.subject}{q.skill_id ? ` · ${q.skill_id}` : ''}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{q.status === 'draft' && <span className="mr-2 rounded bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700">BROUILLON</span>}{q.question}</td>
                  <td className="px-4 py-3 font-bold text-violet-600">{q.correct_option_id}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/admin/questions/${q.id}`} className="text-xs font-semibold text-sky-600 hover:underline">Modifier</Link>
                    <button onClick={() => handleDelete(q.id)} disabled={deleting === q.id}
                      className="text-xs font-semibold text-rose-400 hover:text-rose-600 disabled:opacity-40">
                      {deleting === q.id ? '…' : 'Supprimer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
