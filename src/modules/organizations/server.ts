/** Server-only API of the organizations module (used by API routes). */
export {
  listOrganizations, createOrganization, updateIdentity, listMembers, addMember, removeMember, findOrInviteUser, organizationOfStudent,
} from './infra/organization-repository';
export type { Organization, Member } from './infra/organization-repository';
