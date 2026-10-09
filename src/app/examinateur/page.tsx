'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ExaminerDashboardView } from '@/modules/dashboards';
import { RoleGate } from '@/shared/ui/RoleGate';

export default function ExaminerPage() {
  useEffect(() => {
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').auth.getSession()
      .then(({ data }) => { if (!data.session) window.location.href = '/auth'; });
  }, []);
  return (
    <RoleGate deny="learner">
      <main className="mx-auto max-w-md px-5 pb-16 pt-8">
        <h1 className="mb-1 text-2xl font-black text-[#1a1a2e]">Mes corrections</h1>
        <p className="mb-5 text-sm text-slate-500">Les évaluations rédigées des centres auxquels tu es rattaché.</p>
        <ExaminerDashboardView />
      </main>
    </RoleGate>
  );
}
