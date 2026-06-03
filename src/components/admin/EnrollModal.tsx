'use client';

import React, { useEffect, useState } from 'react';
import type { DbStudent } from '@/lib/db';

interface Enrollment { id: string; student_id: string; student_name?: string }

interface Props {
  parcoursId: string;
  parcoursName: string;
  token: string;
  onClose: () => void;
}

export function EnrollModal({ parcoursId, parcoursName, token, onClose }: Props) {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then((r) => r.json() as Promise<{ students: DbStudent[] }>),
      fetch(`/api/parcours/${parcoursId}/enroll`).then((r) => r.json() as Promise<{ enrollments: Enrollment[] }>),
    ]).then(([s, e]) => {
      setStudents(s.students ?? []);
      setEnrolled(new Set((e.enrollments ?? []).map((x) => x.student_id)));
      setLoading(false);
    });
  }, [parcoursId]);

  async function toggle(studentId: string) {
    const isEnrolled = enrolled.has(studentId);
    const method = isEnrolled ? 'DELETE' : 'POST';
    await fetch(`/api/parcours/${parcoursId}/enroll`, {
      method,
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ studentId }),
    });
    setEnrolled((prev) => {
      const next = new Set(prev);
      isEnrolled ? next.delete(studentId) : next.add(studentId);
      return next;
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black text-[#1a1a2e]">Inscrire des élèves</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
        </div>
        <p className="text-sm text-slate-500">Parcours : <span className="font-semibold text-violet-600">{parcoursName}</span></p>
        {loading ? (
          <p className="text-sm text-slate-400 animate-pulse">Chargement…</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {students.map((s) => {
              const yes = enrolled.has(s.id ?? '');
              return (
                <button key={s.id} onClick={() => toggle(s.id ?? '')}
                  className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${yes ? 'bg-violet-50 border-2 border-violet-400 text-violet-700' : 'bg-slate-50 border-2 border-slate-100 text-slate-700 hover:border-slate-300'}`}>
                  <span className="text-xl">{s.emoji}</span>
                  <span className="flex-1 text-left">{s.name}</span>
                  <span>{yes ? '✓ Inscrit' : '+ Inscrire'}</span>
                </button>
              );
            })}
          </div>
        )}
        <button onClick={onClose}
          className="w-full rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm py-2.5 hover:bg-slate-200 transition-colors">
          Fermer
        </button>
      </div>
    </div>
  );
}
