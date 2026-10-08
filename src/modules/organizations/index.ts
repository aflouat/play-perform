/** Public API of the organizations module: centres (personnes morales), their members and the permissions of each role. */
export type { OrgRole, Membership, AccessContext, Permission } from './domain/access';
export {
  DEFAULT_ORGANIZATION_ID, ORG_ROLES, ROLE_LABEL, canCreateOrganization, canRecruit, canManageStudents,
  canDecideEnrollments, canCorrectEvaluations, organizationsWhere, studentOrganization,
} from './domain/access';
export type { OrganizationInput, MemberInput, Validation } from './domain/inputs';
export { slugify, validateOrganizationInput, validateMemberInput } from './domain/inputs';
export type { MyAccess, Member, Organization } from './infra/organization-client';
export { fetchMyAccess, fetchOrganizations, createCenter, fetchMembers, recruit, dismiss } from './infra/organization-client';
export { TeamLinks } from './ui/TeamLinks';
