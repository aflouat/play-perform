'use client';

import { useState } from 'react';
import type { DbStudent } from '@/lib/db';
import { formatAccessCode } from '@/lib/access-code-format';
import { apiGenerateAccessCode } from '@/lib/students-api';

/** Access code the student types on /apprenant to open their own skills. */
export function AccessCodeBox({ student, onCode }: { student: DbStudent; onCode: (code: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function generate() {
    if (!student.id) return;
    if (student.access_code && !window.confirm('Un nouveau code remplace l’ancien : l’élève devra le saisir à nouveau. Continuer ?')) return;
    setBusy(true); setError(false);
    const code = await apiGenerateAccessCode(student.id);
    setBusy(false);
    if (code) onCode(code.replace('-', '')); else setError(true);
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <span className="text-slate-500">🎒 Accès apprenant{' '}
        <strong className="font-mono text-sm tracking-widest text-[#1a1a2e]">{student.access_code ? formatAccessCode(student.access_code) : '— aucun code —'}</strong>
      </span>
      <button onClick={generate} disabled={busy} className="font-bold text-violet-600 disabled:opacity-40">
        {busy ? '…' : student.access_code ? 'Nouveau code' : 'Créer un code'}
      </button>
      {error && <span role="alert" className="text-rose-600">Échec</span>}
    </div>
  );
}
