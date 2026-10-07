'use client';

import { useState } from 'react';
import { savePlan } from '../infra/pricing-client';
import { billingSuffix, centsToEuros, eurosToCents, validatePlanUpdate, type PricingPlan } from '../domain/plan';

const INPUT = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-violet-500';

/** Admin form for one plan. */
export function PlanEditor({ plan, token, onSaved }: { plan: PricingPlan; token: string; onSaved: (p: PricingPlan) => void }) {
  const [label, setLabel] = useState(plan.label);
  const [price, setPrice] = useState(centsToEuros(plan.priceCents));
  const [description, setDescription] = useState(plan.description);
  const [features, setFeatures] = useState(plan.features.join('\n'));
  const [highlighted, setHighlighted] = useState(plan.highlighted);
  const [active, setActive] = useState(plan.active);
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const priceCents = eurosToCents(price);
    if (priceCents === null) { setStatus({ kind: 'error', text: 'Prix invalide (ex. 4,99).' }); return; }
    const validation = validatePlanUpdate({ label, priceCents, description, features: features.split('\n'), highlighted, active });
    if (!validation.ok) { setStatus({ kind: 'error', text: validation.error }); return; }
    setSaving(true);
    const result = await savePlan(plan.id, validation.value, token);
    setSaving(false);
    if (result.ok) { onSaved(result.plan); setStatus({ kind: 'ok', text: 'Enregistré ✓' }); }
    else setStatus({ kind: 'error', text: result.error });
  }

  const id = (field: string) => `${plan.id}-${field}`;
  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3" aria-label={`Offre ${plan.label}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-black text-slate-900">{plan.label} <span className="text-xs font-semibold text-slate-500">({billingSuffix(plan.id)})</span></h2>
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
          {active ? 'Visible' : 'Masquée'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label htmlFor={id('label')} className="text-xs font-bold text-slate-600">Nom
          <input id={id('label')} value={label} onChange={(e) => setLabel(e.target.value)} className={INPUT} maxLength={40} />
        </label>
        <label htmlFor={id('price')} className="text-xs font-bold text-slate-600">Prix TTC (€)
          <input id={id('price')} value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={INPUT} />
        </label>
      </div>
      <label htmlFor={id('desc')} className="block text-xs font-bold text-slate-600">Description
        <input id={id('desc')} value={description} onChange={(e) => setDescription(e.target.value)} className={INPUT} maxLength={200} />
      </label>
      <label htmlFor={id('features')} className="block text-xs font-bold text-slate-600">Avantages (un par ligne, 8 max)
        <textarea id={id('features')} value={features} onChange={(e) => setFeatures(e.target.value)} rows={3} className={INPUT} />
      </label>
      <div className="flex flex-wrap gap-4 text-sm text-slate-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={highlighted} onChange={(e) => setHighlighted(e.target.checked)} /> Mise en avant</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Visible sur le site</label>
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-50">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {status && <p role="status" className={`text-sm font-semibold ${status.kind === 'ok' ? 'text-emerald-700' : 'text-rose-700'}`}>{status.text}</p>}
      </div>
    </form>
  );
}
