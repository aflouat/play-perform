'use client';

import { useState } from 'react';
import type { DbStudent } from '@/lib/db';
import { saveIdentity, updateRankingSettings } from '@/modules/competition';

/** Pseudonym of a student in rankings (never their real name) and whether they appear at all. */
export function RankingSettings({ student, onChange }: { student: DbStudent; onChange: (patch: Partial<DbStudent>) => void }) {
  const [nickname, setNickname] = useState(student.nickname ?? '');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const visible = student.show_in_ranking !== false;

  async function saveNickname() {
    if (!student.id || !nickname.trim() || nickname === student.nickname) return;
    const failure = await saveIdentity(student.id, { nickname });
    if (failure) setMessage({ ok: false, text: failure });
    else { setMessage({ ok: true, text: 'Pseudo enregistré.' }); onChange({ nickname: nickname.trim() }); }
  }
  async function toggle(next: boolean) {
    if (!student.id) return;
    const failure = await updateRankingSettings(student.id, { showInRanking: next });
    if (failure) setMessage({ ok: false, text: failure }); else onChange({ show_in_ranking: next });
  }

  return (
    <div className="space-y-1.5 rounded-xl bg-slate-50 px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <label htmlFor={`nick-${student.id}`} className="text-slate-500">🏆 Pseudo</label>
        <input id={`nick-${student.id}`} value={nickname} onChange={(e) => setNickname(e.target.value)} onBlur={saveNickname}
          placeholder="généré au premier classement" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1" />
      </div>
      <label className="flex items-center gap-2 text-slate-600">
        <input type="checkbox" checked={visible} onChange={(e) => toggle(e.target.checked)} /> Apparaît au classement et dans la communauté du centre
      </label>
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-emerald-700' : 'text-rose-700'}>{message.text}</p>}
    </div>
  );
}
