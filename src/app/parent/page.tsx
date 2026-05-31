'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { fetchStudents, insertStudent, deleteStudent } from '@/lib/db';
import type { DbStudent } from '@/lib/db';

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  );
}

const GRADIENTS = [
  'from-sky-400 to-blue-500', 'from-pink-400 to-rose-500',
  'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500',
  'from-violet-400 to-purple-500',
];
const EMOJIS = ['🧑‍🎓', '🌸', '🚀', '⭐', '🦁', '🐬', '🎨', '🎸'];

export default function ParentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient().auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/auth'); return; }
      fetchStudents().then((s) => { setStudents(s); setLoading(false); });
    });
  }, [router]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    const student = await insertStudent({
      name: name.trim(), emoji, gradient,
      grade: grade.trim() || 'CE1',
      tagline: `${name.trim()} apprend avec SYNTH.EDU`,
      age: parseInt(age) || 10,
    });
    if (student) setStudents((s) => [...s, student]);
    setName(''); setAge(''); setGrade('');
    setAdding(false);
  }

  async function handleDelete(id: string) {
    await deleteStudent(id);
    setStudents((s) => s.filter((st) => st.id !== id));
  }

  async function handleLogout() {
    await getClient().auth.signOut();
    router.push('/');
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a2e]">Mes élèves</h1>
            <p className="text-slate-500 text-sm">{students.length} profil(s) actif(s)</p>
          </div>
          <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors">
            Déconnexion
          </button>
        </div>

        {/* Student list */}
        <div className="space-y-3">
          {students.map((s) => (
            <div key={s.id} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm">
              <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl shadow`}>
                {s.emoji}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#1a1a2e]">{s.name}</div>
                <div className="text-slate-400 text-xs">{s.grade} · {s.age} ans</div>
              </div>
              <button onClick={() => s.id && handleDelete(s.id)}
                className="text-slate-300 hover:text-rose-400 transition-colors text-lg leading-none">×</button>
            </div>
          ))}
          {students.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Aucun élève — ajoutez-en un ci-dessous.</p>
          )}
        </div>

        {/* Add form */}
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-md p-5 space-y-4">
          <h2 className="font-black text-[#1a1a2e]">Ajouter un élève</h2>
          <div className="grid grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Prénom *" required
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
            <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Âge" type="number" min="4" max="18"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
          </div>
          <input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Classe (ex: 6ème)"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-violet-400" />
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-lg text-xl transition-all ${emoji === e ? 'ring-2 ring-violet-500 bg-violet-50' : 'bg-slate-50 hover:bg-slate-100'}`}>
                {e}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {GRADIENTS.map((g) => (
              <button key={g} type="button" onClick={() => setGradient(g)}
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} transition-all ${gradient === g ? 'ring-2 ring-offset-1 ring-violet-500 scale-110' : ''}`} />
            ))}
          </div>
          <button type="submit" disabled={adding}
            className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40 hover:bg-violet-700 transition-colors">
            {adding ? 'Ajout…' : '+ Ajouter'}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 font-semibold">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
