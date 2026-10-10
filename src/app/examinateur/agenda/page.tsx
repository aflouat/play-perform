'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ExamAgenda } from '@/modules/exams';
import { RoleGate } from '@/shared/ui/RoleGate';

export default function ExaminerAgendaPage() {
  useEffect(() => {
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').auth.getSession()
      .then(({ data }) => { if (!data.session) window.location.href = '/auth'; });
  }, []);
  return (
    <RoleGate deny="learner">
      <main className="mx-auto max-w-3xl px-5 pb-16 pt-8">
        <h1 className="mb-1 text-2xl font-black text-[#1a1a2e]">Agenda des oraux</h1>
        <p className="mb-5 text-sm text-slate-500">Ouvre tes disponibilités : les élèves de tes centres réservent un créneau (30 min par défaut) pour passer l’oral d’une compétence.</p>
        <ExamAgenda />
      </main>
    </RoleGate>
  );
}
