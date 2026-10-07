import type { PlanId, PlanUpdate, PricingPlan } from '../domain/plan';

/** Browser-side calls to /api/pricing. */
export async function fetchActivePlans(): Promise<PricingPlan[]> {
  const res = await fetch('/api/pricing');
  if (!res.ok) return [];
  return ((await res.json()) as { plans: PricingPlan[] }).plans;
}

export async function fetchAllPlans(token: string): Promise<PricingPlan[]> {
  const res = await fetch('/api/pricing?all=1', { headers: { authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(res.status === 403 ? 'Accès réservé aux administrateurs.' : 'Impossible de charger les tarifs.');
  return ((await res.json()) as { plans: PricingPlan[] }).plans;
}

export async function savePlan(
  id: PlanId, update: PlanUpdate, token: string,
): Promise<{ ok: true; plan: PricingPlan } | { ok: false; error: string }> {
  const res = await fetch(`/api/pricing/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify(update),
  });
  const body = (await res.json().catch(() => ({}))) as { plan?: PricingPlan; error?: string };
  return res.ok && body.plan ? { ok: true, plan: body.plan } : { ok: false, error: body.error ?? 'Erreur serveur.' };
}
