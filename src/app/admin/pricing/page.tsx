'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchAllPlans, PlanEditor, type PricingPlan } from '@/modules/pricing';

function getSupabase() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '');
}

export default function AdminPricingPage() {
  const [token, setToken] = useState('');
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) { window.location.href = '/auth'; return; }
      setToken(data.session.access_token);
      fetchAllPlans(data.session.access_token).then(setPlans).catch((e: Error) => setError(e.message));
    });
  }, []);

  const replace = (updated: PricingPlan) => setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-[#1a1a2e]">Tarifs des abonnements</h1>
        <p className="text-slate-500 text-xs mt-0.5">Affichés dans la section « Nos abonnements » de la page d&apos;accueil.</p>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800">{error}</p>}
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => <PlanEditor key={plan.id} plan={plan} token={token} onSaved={replace} />)}
      </div>
    </div>
  );
}
