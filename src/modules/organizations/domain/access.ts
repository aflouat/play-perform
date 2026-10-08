/** Fixed id of the parent company ("société mère"): every existing and anonymous record belongs to it. */
export const DEFAULT_ORGANIZATION_ID = '00000000-0000-4000-8000-000000000001';

export type OrgRole = 'org_admin' | 'teacher' | 'examiner';
export const ORG_ROLES: readonly OrgRole[] = ['org_admin', 'teacher', 'examiner'];

export const ROLE_LABEL: Record<OrgRole, string> = {
  org_admin: 'Responsable du centre',
  teacher: 'Enseignant',
  examiner: 'Examinateur',
};

export interface Membership { organizationId: string; role: OrgRole }

/** Who is calling: platform-wide flag + the centres they belong to (an examiner may belong to several). */
export interface AccessContext {
  userId: string;
  email: string;
  isSuperAdmin: boolean;
  memberships: readonly Membership[];
}

export type Permission = (ctx: AccessContext, organizationId: string) => boolean;

const hasRole = (ctx: AccessContext, organizationId: string, roles: readonly OrgRole[]) =>
  ctx.memberships.some((m) => m.organizationId === organizationId && roles.includes(m.role));

export const canCreateOrganization = (ctx: AccessContext): boolean => ctx.isSuperAdmin;

/** Recruit teachers and examiners into a centre. */
export const canRecruit: Permission = (ctx, org) => ctx.isSuperAdmin || hasRole(ctx, org, ['org_admin']);

/** Add students, give them an access code. */
export const canManageStudents: Permission = (ctx, org) => ctx.isSuperAdmin || hasRole(ctx, org, ['org_admin', 'teacher']);

/** Accept or refuse the enrollment requests of the centre's students. */
export const canDecideEnrollments: Permission = (ctx, org) => ctx.isSuperAdmin || hasRole(ctx, org, ['org_admin', 'teacher']);

/** Correct the written evaluations of the centre's students. */
export const canCorrectEvaluations: Permission = (ctx, org) => ctx.isSuperAdmin || hasRole(ctx, org, ['org_admin', 'examiner']);

/** Centres where `permission` holds: "all" for the super admin. */
export function organizationsWhere(ctx: AccessContext, permission: Permission): 'all' | string[] {
  if (ctx.isSuperAdmin) return 'all';
  return [...new Set(ctx.memberships.map((m) => m.organizationId))].filter((org) => permission(ctx, org));
}

/** Centre a new student joins: the one the teacher works for, else the parent company. */
export function studentOrganization(ctx: AccessContext): string {
  const own = ctx.memberships.find((m) => m.role === 'teacher' || m.role === 'org_admin');
  return own?.organizationId ?? DEFAULT_ORGANIZATION_ID;
}
