'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { ParcoursForm } from '@/components/admin/ParcoursForm';
import { EnrollModal } from '@/components/admin/EnrollModal';
import type { DbParcours } from '@/lib/db';
import type { Subject } from '@/types';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

export default function EditParcoursPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [parcours, setParcours] = useState<DbParcours | null>(null);
  const [token, setToken] = useState('');
  const [showEnroll, setShowEnroll] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
      fetch(`/api/parcours/${id}`)
        .then((r) => r.json() as Promise<{ parcours: DbParcours }>)
        .then((d) => setParcours(d.parcours));
    });
  }, [id]);

  async function handleSave(data: { name: string; emoji: string; description: string; subjects: Subject[]; questionsPerSubject: number }) {
    await fetch(`/api/parcours/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...data, subjects: data.subjects }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!parcours) {
    return <div className="text-slate-400 text-sm animate-pulse">Chargement…</div>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-600 text-sm">← Retour</button>
        <h1 className="text-xl font-black text-[#1a1a2e]">{parcours.emoji} {parcours.name}</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 mb-4">Modifier le parcours</h2>
        <ParcoursForm
          initial={{
            name: parcours.name,
            emoji: parcours.emoji,
            description: parcours.description,
            subjects: parcours.subjects as Subject[],
            questionsPerSubject: parcours.questions_per_subject,
          }}
          onSubmit={handleSave}
          submitLabel={saved ? '✓ Sauvegardé !' : 'Enregistrer'}
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-bold text-slate-700 mb-3">Inscriptions élèves</h2>
        <p className="text-sm text-slate-400 mb-4">Gérez quels élèves participent à ce parcours.</p>
        <button onClick={() => setShowEnroll(true)}
          className="rounded-xl bg-violet-600 text-white text-sm font-bold px-4 py-2 hover:bg-violet-700 transition-colors">
          👤 Gérer les inscriptions
        </button>
      </div>

      {showEnroll && (
        <EnrollModal
          parcoursId={id}
          parcoursName={parcours.name}
          token={token}
          onClose={() => setShowEnroll(false)}
        />
      )}
    </div>
  );
}
