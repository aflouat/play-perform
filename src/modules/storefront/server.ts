/** Server-only API of the storefront module (API routes and the server-rendered centre page). */
export { getPublicCentre, countOpenSlots, insertLead, listLeads, organizationOfLead, setLeadStatus } from './infra/storefront-repository';
export type { Lead } from './infra/storefront-repository';
