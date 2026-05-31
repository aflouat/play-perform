'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import type { DbStudent } from '@/lib/db';
import { StudentCard } from '@/components/parent/StudentCard';
import { AddStudentForm } from '@/components/parent/AddStudentForm';
import { apiFetchStudents } from '@/lib/students-api';

function getClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

export default function ParentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient().auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/auth'); return; }
      apiFetchStudents().then((s) => { setStudents(s); setLoading(false); });
    });
  }, [router]);

  function handleDelete(id: string) { setStudents((s) => s.filter((st) => st.id !== id)); }
  function handleUpdated(updated: DbStudent) { setStudents((s) => s.map((st) => st.id === updated.id ? updated : st)); }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-black text-[#1a1a2e]">Mes élèves</h1><p className="text-slate-500 text-sm">{students.length} profil(s)</p></div>
          <button onClick={() => getClient().auth.signOut().then(() => router.push('/'))}
            className="text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors">Déconnexion</button>
        </div>

        <div className="space-y-3">
          {students.map((s) => <StudentCard key={s.id} student={s} onDelete={handleDelete} onUpdated={handleUpdated} />)}
          {students.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Aucun élève — ajoutez-en un ci-dessous.</p>}
        </div>

        <AddStudentForm onAdded={(student) => setStudents((s) => [...s, student])} />

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 font-semibold">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    </div>
  );
}
