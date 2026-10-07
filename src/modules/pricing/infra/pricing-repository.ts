import { getServerClient } from '@/lib/db/client';
import type { PlanId, PlanUpdate, PricingPlan } from '../domain/plan';

interface PlanRow {
  id: PlanId; label: string; price_cents: number; currency: 'EUR'; description: string;
  features: string[]; highlighted: boolean; active: boolean; sort_order: number;
}

const toPlan = (r: PlanRow): PricingPlan => ({
  id: r.id, label: r.label, priceCents: r.price_cents, currency: r.currency, description: r.description,
  features: r.features ?? [], highlighted: r.highlighted, active: r.active, sortOrder: r.sort_order,
});

/** Server-side only (service role). */
export async function fetchPlans({ activeOnly }: { activeOnly: boolean }): Promise<PricingPlan[]> {
  let query = getServerClient().from('pricing_plans').select('*').order('sort_order');
  if (activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as PlanRow[]).map(toPlan);
}

export async function updatePlan(id: PlanId, update: PlanUpdate): Promise<PricingPlan> {
  const { data, error } = await getServerClient()
    .from('pricing_plans')
    .update({
      label: update.label, price_cents: update.priceCents, description: update.description,
      features: update.features, highlighted: update.highlighted, active: update.active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return toPlan(data as PlanRow);
}
