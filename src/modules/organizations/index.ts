/** Public API of the organizations module: centres (personnes morales), their members and the permissions of each role. */
export type { OrgRole, Membership, AccessContext, Permission } from './domain/access';
export {
  DEFAULT_ORGANIZATION_ID, ORG_ROLES, ROLE_LABEL, canCreateOrganization, canRecruit, canManageStudents,
  canDecideEnrollments, canCorrectEvaluations, organizationsWhere, studentOrganization,
} from './domain/access';
export type { OrganizationInput, MemberInput, Validation } from './domain/inputs';
export { slugify, validateOrganizationInput, validateMemberInput } from './domain/inputs';
export type { MyAccess, Member, Organization } from './infra/organization-client';
export { fetchMyAccess, fetchOrganizations, createCenter, fetchMembers, recruit, dismiss, saveIdentity, submitCentreApplication, fetchMyApplication, fetchPendingApplications, decideCentreApplication } from './infra/organization-client';
export { TeamLinks } from './ui/TeamLinks';
export { CentreCard } from './ui/CentreCard';
export { CentreApplicationBanner } from './ui/CentreApplicationBanner';
export { ApplicationsReview } from './ui/ApplicationsReview';
export { CentreIdentityForm } from './ui/CentreIdentityForm';
export type { CentreIdentity, StoredIdentity } from './domain/identity';
export { validateSiren, validateSiret, validateCentreIdentity, formatSiren, formatSiret, isIdentityComplete } from './domain/identity';
export type { CentreApplication, ApplicationStatus, ApplicationInput, ApplicationDecision } from './domain/application';
export { validateCentreApplication, validateApplicationDecision } from './domain/application';
export type { NavLink, NavAccess } from './domain/navigation';
export { adminLinks, centreHeaderLinks, navAccessOf } from './domain/navigation';
export { AdminNav } from './ui/AdminNav';
export { SuperAdminGate } from './ui/SuperAdminGate';
