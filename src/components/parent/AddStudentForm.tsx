'use client';

import React, { useState } from 'react';
import type { DbStudent, StudentMode, StudentLearningMode } from '@/lib/db';
import { STUDENT_MODE_LABELS } from '@/lib/learning-mode';
import { apiInsertStudent } from '@/lib/students-api';

const GRADIENTS = ['from-sky-400 to-blue-500', 'from-pink-400 to-rose-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500', 'from-violet-400 to-purple-500'];
const EMOJIS = ['🧑‍🎓', '🌸', '🚀', '⭐', '🦁', '🐬', '🎨', '🎸'];
const MODES: StudentMode[] = ['quiz', 'words', 'keyboard'];

interface Props { onAdded: (student: DbStudent) => void; }

export function AddStudentForm({ onAdded }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [grade, setGrade] = useState('');
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [gradient, setGradient] = useState(GRADIENTS[0]);
  const [mode, setMode] = useState<StudentMode>('quiz');
  const [learningMode, setLearningMode] = useState<StudentLearningMode>('advanced');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true); setAddError(null);
    const student = await apiInsertStudent({
      name: name.trim(), emoji, gradient,
      grade: grade.trim() || 'CE1',
      tagline: `${name.trim()} apprend avec  Play Perform`,
      age: parseInt(age) || 10,
      mode, learning_mode: learningMode,
    });
    if (student) {
      onAdded(student);
      setName(''); setAge(''); setGrade('');
    } else {
      setAddError('Erreur lors de l\'ajout. Vérifiez votre connexion ou relancez la page.');
    }
    setAdding(false);
  }

  return (
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

      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">Activité par défaut</p>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => { const meta = STUDENT_MODE_LABELS[m]; return (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`rounded-xl p-2.5 text-center transition-all border ${mode === m ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
              <div className="text-lg">{meta.emoji}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{meta.label}</div>
            </button>
          );})}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-slate-500 mb-2">Mode d&apos;apprentissage</p>
        <div className="grid grid-cols-2 gap-2">
          {(['advanced', 'assisted'] as StudentLearningMode[]).map((lm) => (
            <button key={lm} type="button" onClick={() => setLearningMode(lm)}
              className={`rounded-xl p-3 text-center transition-all border ${learningMode === lm ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
              <div className="text-xl">{lm === 'advanced' ? '🚀' : '🤝'}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{lm === 'advanced' ? 'Avancé' : 'Assisté'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {EMOJIS.map((e) => <button key={e} type="button" onClick={() => setEmoji(e)}
          className={`w-9 h-9 rounded-lg text-xl transition-all ${emoji === e ? 'ring-2 ring-violet-500 bg-violet-50' : 'bg-slate-50 hover:bg-slate-100'}`}>{e}</button>)}
      </div>
      <div className="flex gap-2">
        {GRADIENTS.map((g) => <button key={g} type="button" onClick={() => setGradient(g)}
          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} transition-all ${gradient === g ? 'ring-2 ring-offset-1 ring-violet-500 scale-110' : ''}`} />)}
      </div>
      {addError && <p className="text-rose-600 text-sm bg-rose-50 rounded-xl px-3 py-2">{addError}</p>}
      <button type="submit" disabled={adding}
        className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-40 hover:bg-violet-700 transition-colors">
        {adding ? 'Ajout…' : '+ Ajouter'}
      </button>
    </form>
  );
}
