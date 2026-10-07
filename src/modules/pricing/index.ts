/**
 * Public, client-safe API of the pricing module.
 * Server-only data access lives in `./server` (API routes only).
 */
export type { PlanId, PricingPlan, PlanUpdate } from './domain/plan';
export {
  PLAN_IDS, isPlanId, formatPrice, billingSuffix, eurosToCents, centsToEuros,
  yearlySavingPercent, validatePlanUpdate,
} from './domain/plan';
export { fetchActivePlans, fetchAllPlans, savePlan } from './infra/pricing-client';
export { PricingSection } from './ui/PricingSection';
export { PlanEditor } from './ui/PlanEditor';
