/** Subscription plans shown on the home page and managed in the admin area. */
export type PlanId = 'monthly' | 'yearly' | 'lifetime';

export interface PricingPlan {
  id: PlanId;
  label: string;
  priceCents: number;
  currency: 'EUR';
  description: string;
  features: string[];
  /** Visually emphasised ("Le plus choisi") */
  highlighted: boolean;
  active: boolean;
  sortOrder: number;
}

/** Fields an admin can edit. */
export type PlanUpdate = Pick<PricingPlan, 'label' | 'priceCents' | 'description' | 'features' | 'highlighted' | 'active'>;

export const PLAN_IDS: readonly PlanId[] = ['monthly', 'yearly', 'lifetime'];
const MAX_PRICE_CENTS = 1_000_000;
const MAX_FEATURES = 8;

export function isPlanId(value: string): value is PlanId {
  return (PLAN_IDS as readonly string[]).includes(value);
}

export function formatPrice(cents: number, currency: PricingPlan['currency'] = 'EUR'): string {
  const fractionDigits = cents % 100 === 0 ? 0 : 2;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency, minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits,
  }).format(cents / 100);
}

export function billingSuffix(id: PlanId): string {
  return id === 'monthly' ? '/ mois' : id === 'yearly' ? '/ an' : 'une seule fois';
}

/** "4,99" | "4.99" | "5" → cents. null when the input is not a valid positive amount (max 2 decimals). */
export function eurosToCents(input: string): number | null {
  const normalized = input.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function centsToEuros(cents: number): string {
  return (cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2)).replace('.', ',');
}

/** Saving of the yearly plan compared with 12 monthly payments, in %, or null if none. */
export function yearlySavingPercent(monthlyCents: number, yearlyCents: number): number | null {
  if (monthlyCents <= 0) return null;
  const saving = Math.round((1 - yearlyCents / (monthlyCents * 12)) * 100);
  return saving > 0 ? saving : null;
}

type ValidationResult = { ok: true; value: PlanUpdate } | { ok: false; error: string };

/** Validates an admin payload (untrusted input). */
export function validatePlanUpdate(input: unknown): ValidationResult {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'Données invalides.' };
  const raw = input as Record<string, unknown>;
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : null;
  const { priceCents, highlighted, active } = raw;

  if (!label || label.length > 40) return { ok: false, error: 'Le nom doit faire entre 1 et 40 caractères.' };
  if (description === null || description.length > 200) return { ok: false, error: 'La description doit faire 200 caractères maximum.' };
  if (typeof priceCents !== 'number' || !Number.isInteger(priceCents) || priceCents < 0 || priceCents > MAX_PRICE_CENTS) {
    return { ok: false, error: 'Le prix doit être un montant positif.' };
  }
  if (typeof highlighted !== 'boolean' || typeof active !== 'boolean') return { ok: false, error: 'Options invalides.' };
  if (!Array.isArray(raw.features) || raw.features.some((f) => typeof f !== 'string')) {
    return { ok: false, error: 'Avantages invalides.' };
  }
  const features = (raw.features as string[]).map((f) => f.trim()).filter(Boolean);
  if (features.length > MAX_FEATURES || features.some((f) => f.length > 80)) {
    return { ok: false, error: `${MAX_FEATURES} avantages maximum, 80 caractères chacun.` };
  }
  return { ok: true, value: { label, priceCents, description, features, highlighted, active } };
}
