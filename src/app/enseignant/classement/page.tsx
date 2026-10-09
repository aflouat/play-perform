'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchTeacherAwards, revokeAwardRequest, type TeacherAward } from '@/modules/competition';

export default function TeacherAwardsPage() {
  const [awards, setAwards] = useState<TeacherAward[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => { fetchTeacherAwards().then(setAwards); }, []);

  useEffect(() => {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
    db.auth.getSession().then(({ data }) => { if (!data.session) window.location.href = '/auth'; else load(); });
  }, [load]);

  async function revoke(award: TeacherAward) {
    if (!window.confirm(`Retirer la médaille ${award.medal} de ${award.nickname} (${award.week}) ?`)) return;
    const failure = await revokeAwardRequest(award.profileId, award.week);
    if (failure) setError(failure); else load();
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10">
      <div className="mx-auto max-w-md space-y-5">
        <Link href="/enseignant" className="text-xs font-semibold text-slate-400 hover:text-slate-600">← Mes élèves</Link>
        <div>
          <h1 className="text-2xl font-black text-[#1a1a2e]">Médailles de la compétition</h1>
          <p className="text-sm text-slate-500">Les médailles du défi hebdomadaire sont attribuées automatiquement. Tu peux en retirer une : personne ne prend sa place.</p>
        </div>
        {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}
        {awards?.length === 0 && <p className="text-sm text-slate-500">Aucune médaille récente pour tes élèves.</p>}
        <ul className="space-y-2">
          {awards?.map((a) => (
            <li key={`${a.week}-${a.profileId}`} className="flex items-center justify-between rounded-xl bg-white p-3 text-sm shadow-sm">
              <span>{a.medal} <strong>{a.nickname}</strong> <span className="text-xs text-slate-400">· {a.week}</span></span>
              <button onClick={() => revoke(a)} className="text-xs font-bold text-rose-500">Retirer</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
