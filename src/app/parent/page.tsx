'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { fetchStudents, insertStudent } from '@/lib/db';
import type { DbStudent, StudentMode, StudentLearningMode } from '@/lib/db';
import { StudentCard } from '@/components/parent/StudentCard';
import { STUDENT_MODE_LABELS } from '@/lib/learning-mode';

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
const MODES: StudentMode[] = ['quiz', 'words', 'keyboard'];

export default function ParentPage() {
  const router = useRouter();
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [mode, setMode] = useState<StudentMode>('quiz');
  const [learningMode, setLearningMode] = useState<StudentLearningMode>('advanced');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState<string | undefined>();

  useEffect(() => {
    getClient().auth.getSession().then(({ data }) => {
      if (!data.session) { router.replace('/auth'); return; }
      setParentId(data.session.user.id);
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
      mode,
      learning_mode: learningMode,
    }, parentId);
    if (student) setStudents((s) => [...s, student]);
    setName(''); setAge(''); setGrade('');
    setAdding(false);
  }

  function handleDelete(id: string) {
    setStudents((s) => s.filter((st) => st.id !== id));
  }

  function handleUpdated(updated: DbStudent) {
    setStudents((s) => s.map((st) => st.id === updated.id ? updated : st));
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">Chargement…</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#1a1a2e]">Mes élèves</h1>
            <p className="text-slate-500 text-sm">{students.length} profil(s)</p>
          </div>
          <button onClick={() => getClient().auth.signOut().then(() => router.push('/'))}
            className="text-xs text-slate-400 hover:text-rose-500 font-semibold transition-colors">
            Déconnexion
          </button>
        </div>

        <div className="space-y-3">
          {students.map((s) => (
            <StudentCard key={s.id} student={s} onDelete={handleDelete} onUpdated={handleUpdated} />
          ))}
          {students.length === 0 && (
            <p className="text-slate-400 text-sm text-center py-4">Aucun élève — ajoutez-en un ci-dessous.</p>
          )}
        </div>

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

          {/* Mode de jeu */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">Mode de jeu</p>
            <div className="grid grid-cols-3 gap-2">
              {MODES.map((m) => {
                const meta = STUDENT_MODE_LABELS[m];
                return (
                  <button key={m} type="button" onClick={() => setMode(m)}
                    className={`rounded-xl p-2.5 text-center transition-all border ${mode === m ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                    <div className="text-lg">{meta.emoji}</div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">{meta.label}</div>
                    <div className="text-xs text-slate-400 leading-tight mt-0.5">{meta.description.split(',')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode d'apprentissage */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">Mode d'apprentissage</p>
            <div className="grid grid-cols-2 gap-2">
              {(['advanced', 'assisted'] as StudentLearningMode[]).map((lm) => (
                <button key={lm} type="button" onClick={() => setLearningMode(lm)}
                  className={`rounded-xl p-3 text-center transition-all border ${learningMode === lm ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                  <div className="text-xl">{lm === 'advanced' ? '🚀' : '🤝'}</div>
                  <div className="text-xs font-bold text-slate-700 mt-0.5">{lm === 'advanced' ? 'Avancé' : 'Assisté'}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lm === 'advanced' ? 'Autonome' : 'Avec aide'}</div>
                </button>
              ))}
            </div>
          </div>

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
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600 font-semibold">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
