'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchActivePlans } from '../infra/pricing-client';
import { billingSuffix, formatPrice, yearlySavingPercent, type PricingPlan } from '../domain/plan';

/** Public pricing (1 month / 1 year / lifetime). Hidden if prices cannot be loaded. */
export function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetchActivePlans().then((p) => { if (alive) setPlans(p); }).catch(() => { if (alive) setPlans([]); });
    return () => { alive = false; };
  }, []);

  if (plans !== null && plans.length === 0) return null;
  const monthly = plans?.find((p) => p.id === 'monthly');

  return (
    <section id="tarifs" aria-labelledby="pricing-title" className="mx-auto max-w-5xl px-4 py-12 scroll-mt-24">
      <h2 id="pricing-title" className="text-2xl sm:text-3xl font-black text-slate-900 text-center">Nos abonnements</h2>
      <p className="mt-2 text-center text-slate-600">Le test de niveau reste gratuit. Choisis la formule qui te convient pour aller plus loin.</p>

      <ul className="mt-8 grid gap-4 md:grid-cols-3" aria-busy={plans === null}>
        {plans === null
          ? [0, 1, 2].map((i) => <li key={i} className="h-72 rounded-3xl bg-slate-200/60 motion-safe:animate-pulse" />)
          : plans.map((plan) => {
              const saving = plan.id === 'yearly' && monthly ? yearlySavingPercent(monthly.priceCents, plan.priceCents) : null;
              return (
                <li key={plan.id} className={`relative flex flex-col rounded-3xl bg-white p-6 shadow-sm border-2 ${
                  plan.highlighted ? 'border-violet-600 shadow-lg' : 'border-slate-200'}`}>
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3 py-1 text-xs font-bold text-white">
                      Le plus choisi
                    </span>
                  )}
                  <h3 className="text-lg font-black text-slate-900">{plan.label}</h3>
                  <p className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900">{formatPrice(plan.priceCents, plan.currency)}</span>
                    <span className="text-sm font-semibold text-slate-500">{billingSuffix(plan.id)}</span>
                  </p>
                  {saving !== null && <p className="mt-1 text-sm font-bold text-emerald-700">Économise {saving} % par rapport au mensuel</p>}
                  <p className="mt-3 text-sm text-slate-600">{plan.description}</p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-700 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2"><span aria-hidden="true" className="text-violet-600 font-black">✓</span>{f}</li>
                    ))}
                  </ul>
                  <Link href="/auth?signup=1" aria-label={`Choisir l'offre ${plan.label}`}
                    className={`mt-6 rounded-xl px-5 py-3 text-center font-bold ${plan.highlighted
                      ? 'bg-violet-600 text-white hover:bg-violet-700' : 'border-2 border-violet-200 text-violet-700 hover:bg-violet-50'}`}>
                    Choisir cette offre
                  </Link>
                </li>
              );
            })}
      </ul>
      <p className="mt-4 text-center text-xs text-slate-500">Prix TTC. Le paiement en ligne arrive bientôt : l&apos;inscription est gratuite en attendant.</p>
    </section>
  );
}
