'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ParcoursForm } from '@/components/admin/ParcoursForm';
import { EnrollModal } from '@/components/admin/EnrollModal';
import type { DbParcours } from '@/lib/db';
import type { Subject } from '@/types';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

const SUBJECT_LABELS: Record<string, string> = {
  maths: 'Maths', francais: 'Français', svt: 'SVT', histoire: 'Histoire',
  physique: 'Physique', anglais: 'Anglais', espagnol: 'Espagnol',
  espace: '🪐', chimie: '⚗️', geo: '🌍', informatique: '💻', mecanique: '⚙️', meteo: '🌤️', telecom: '📡',
};

export default function AdminParcoursPage() {
  const [parcours, setParcours] = useState<DbParcours[]>([]);
  const [token, setToken] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [enrollTarget, setEnrollTarget] = useState<DbParcours | null>(null);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
      fetch('/api/parcours')
        .then((r) => r.json() as Promise<{ parcours: DbParcours[] }>)
        .then((d) => setParcours(d.parcours ?? []));
    });
  }, []);

  async function handleCreate(data: { name: string; emoji: string; description: string; subjects: Subject[]; questionsPerSubject: number }) {
    const res = await fetch('/api/parcours', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...data, subjects: data.subjects }),
    });
    const { parcours: created } = await res.json() as { parcours: DbParcours };
    setParcours((prev) => [...prev, created]);
    setShowForm(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Supprimer ce parcours ?')) return;
    await fetch(`/api/parcours/${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
    setParcours((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#1a1a2e]">Parcours</h1>
          <p className="text-slate-400 text-xs mt-0.5">Créez des parcours multi-disciplines et inscrivez vos élèves.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="rounded-xl bg-violet-600 text-white text-sm font-bold px-4 py-2 hover:bg-violet-700 transition-colors">
          {showForm ? '✕ Annuler' : '+ Nouveau parcours'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5">
          <h2 className="font-black text-[#1a1a2e] mb-4">Nouveau parcours</h2>
          <ParcoursForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {parcours.length === 0 && !showForm && (
        <div className="rounded-2xl bg-white border border-slate-100 p-10 text-center text-slate-400 text-sm">
          Aucun parcours. Cliquez sur "+ Nouveau parcours" pour commencer.
        </div>
      )}

      <div className="grid gap-4">
        {parcours.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start gap-4">
              <span className="text-3xl">{p.emoji}</span>
              <div className="flex-1">
                <div className="font-black text-[#1a1a2e] text-base">{p.name}</div>
                {p.description && <div className="text-slate-500 text-sm mt-0.5">{p.description}</div>}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {p.subjects.map((s) => (
                    <span key={s} className="text-xs bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
                      {SUBJECT_LABELS[s] ?? s}
                    </span>
                  ))}
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">
                    {p.questions_per_subject} q./matière
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => setEnrollTarget(p)}
                  className="text-xs font-semibold text-violet-600 hover:text-violet-800 bg-violet-50 px-3 py-1.5 rounded-lg transition-colors">
                  👤 Inscrire
                </button>
                <Link href={`/admin/parcours/${p.id}`}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 px-3 py-1.5 rounded-lg text-center transition-colors">
                  ✏️ Modifier
                </Link>
                <button onClick={() => handleDelete(p.id ?? '')}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg transition-colors">
                  🗑 Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrollTarget && (
        <EnrollModal
          parcoursId={enrollTarget.id ?? ''}
          parcoursName={enrollTarget.name}
          token={token}
          onClose={() => setEnrollTarget(null)}
        />
      )}
    </div>
  );
}
