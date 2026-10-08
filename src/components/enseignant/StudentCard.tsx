'use client';

import React, { useState } from 'react';
import type { DbStudent } from '@/lib/db';
import { apiDeleteStudent, apiUpdateStudent } from '@/lib/students-api';

interface StudentScore { xp: number; level: number; }

function loadStudentScore(id?: string): StudentScore | null {
  if (typeof window === 'undefined' || !id) return null;
  try {
    const raw = localStorage.getItem(`score:${id}`);
    return raw ? (JSON.parse(raw) as StudentScore) : null;
  } catch { return null; }
}

interface StudentCardProps {
  student: DbStudent;
  onDelete: (id: string) => void;
  onUpdated: (updated: DbStudent) => void;
}

export function StudentCard({ student, onDelete, onUpdated }: StudentCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [age, setAge] = useState(String(student.age));
  const [grade, setGrade] = useState(student.grade);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [score] = useState<StudentScore | null>(() => loadStudentScore(student.id));

  async function handleSave() {
    if (!student.id || !name.trim()) return;
    setSaving(true);
    const updates: Partial<DbStudent> = { name: name.trim(), age: parseInt(age) || student.age, grade: grade.trim() || student.grade };
    const ok = await apiUpdateStudent(student.id, updates);
    if (ok) onUpdated({ ...student, ...updates });
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    if (!student.id) return;
    if (!window.confirm(`Supprimer ${student.name} ?`)) return;
    setDeleting(true);
    const ok = await apiDeleteStudent(student.id);
    if (ok) onDelete(student.id);
    else { alert('Erreur lors de la suppression.'); setDeleting(false); }
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${student.gradient} flex items-center justify-center text-2xl shadow`}>
          {student.emoji}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:border-violet-400" placeholder="Prénom" />
              <div className="grid grid-cols-2 gap-2">
                <input value={age} onChange={(e) => setAge(e.target.value)} type="number" min="4" max="18"
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:border-violet-400" placeholder="Âge" />
                <input value={grade} onChange={(e) => setGrade(e.target.value)}
                  className="rounded-lg border border-slate-200 px-2 py-1 text-sm focus:outline-none focus:border-violet-400" placeholder="Classe" />
              </div>
            </div>
          ) : (
            <>
              <div className="font-bold text-[#1a1a2e]">{student.name}</div>
              <div className="text-slate-400 text-xs">{student.grade} · {student.age} ans</div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!editing && <button onClick={() => setEditing(true)} className="text-slate-400 hover:text-violet-500 transition-colors text-sm" title="Modifier">✏️</button>}
          <button onClick={handleDelete} disabled={deleting}
            className="text-slate-300 hover:text-rose-400 disabled:opacity-40 transition-colors text-lg leading-none">
            {deleting ? '…' : '×'}
          </button>
        </div>
      </div>

      {score && (
        <div className="flex items-center gap-1 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 border border-amber-200">
            <span className="text-amber-600 font-bold">⭐ Niv.{score.level}</span>
            <span className="text-amber-400">· {score.xp} XP</span>
          </span>
        </div>
      )}

      {editing && (
        <div className="flex gap-2 pt-1">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-bold disabled:opacity-40">
            {saving ? '…' : 'Enregistrer'}
          </button>
          <button onClick={() => { setEditing(false); setName(student.name); setAge(String(student.age)); setGrade(student.grade); }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
            Annuler
          </button>
        </div>
      )}
    </div>
  );
}
