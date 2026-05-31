'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import type { DbQuestion } from '@/lib/db';

const SUBJECTS = [
  'maths','francais','svt','histoire','physique','espace','meteo',
  'chimie','mecanique','geo','anglais','espagnol','informatique','telecom',
];
const DIFF_LABEL: Record<number, string> = { 1: '🌱', 2: '📖', 3: '⚡', 4: '🔥' };

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}

export default function AdminQuestionsPage() {
  const [subject, setSubject] = useState('');
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const url = subject ? `/api/questions?subject=${subject}` : '/api/questions';
    const res = await fetch(url);
    const data = await res.json() as { questions: DbQuestion[] };
    setQuestions(data.questions);
    setLoading(false);
  }, [subject]);

  useEffect(() => { if (token) load(); }, [load, token]);

  async function handleDelete(id: string) {
    if (!window.confirm(`Supprimer "${id}" ?`)) return;
    setDeleting(id);
    await fetch(`/api/questions/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${token}` },
    });
    setQuestions((q) => q.filter((x) => x.id !== id));
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1a1a2e]">Questions importées</h1>
          <p className="text-slate-400 text-xs mt-0.5">Seules les questions importées (DB) sont éditables ici.</p>
        </div>
        <Link href="/admin/import" className="rounded-xl bg-violet-600 text-white text-sm font-bold px-4 py-2 hover:bg-violet-700 transition-colors">
          + Importer
        </Link>
      </div>

      <div className="flex gap-3 items-center">
        <select value={subject} onChange={(e) => setSubject(e.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-violet-400">
          <option value="">Toutes les matières</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-slate-400 text-sm">{questions.length} question(s)</span>
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
                <th className="px-4 py-3 text-left">Matière</th>
                <th className="px-4 py-3 text-left">Question</th>
                <th className="px-4 py-3 text-left">Rép.</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-lg">{DIFF_LABEL[q.difficulty] ?? q.difficulty}</td>
                  <td className="px-4 py-3 font-mono text-slate-500 text-xs">{q.subject}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{q.question}</td>
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
