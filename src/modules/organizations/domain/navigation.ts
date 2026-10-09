import type { OrgRole } from './access';

export interface NavLink { href: string; label: string }
export interface NavAccess { isSuperAdmin: boolean; roles: readonly OrgRole[] }

const has = (a: NavAccess, role: OrgRole) => a.roles.includes(role);
const students = (a: NavAccess) => has(a, 'teacher') || has(a, 'org_admin');
const corrections = (a: NavAccess) => a.isSuperAdmin || has(a, 'examiner') || has(a, 'org_admin');
const enrollments = (a: NavAccess) => a.isSuperAdmin || students(a);

/**
 * Menu of the back-office: each role sees only the screens it may use.
 * The super admin (parent company) also runs what all centres share: questions, import, learning routes, prices, centres.
 */
export function adminLinks(a: NavAccess): NavLink[] {
  return [
    ...(a.isSuperAdmin ? [
      { href: '/admin/questions', label: 'Questions' }, { href: '/admin/import', label: 'Import CSV' },
      { href: '/admin/parcours', label: 'Parcours' }, { href: '/admin/pricing', label: 'Tarifs' }, { href: '/admin/organisations', label: 'Centres' },
    ] : []),
    ...(!a.isSuperAdmin && students(a) ? [{ href: '/enseignant', label: 'Élèves' }] : []),
    ...(enrollments(a) ? [{ href: '/admin/inscriptions', label: 'Inscriptions' }] : []),
    ...(corrections(a) ? [{ href: '/admin/evaluations', label: 'Corrections' }] : []),
    ...(!a.isSuperAdmin && has(a, 'org_admin') ? [{ href: '/admin/organisations', label: 'Équipe' }] : []),
  ];
}

/** Short menu of the site header for a signed-in centre account. */
export function centreHeaderLinks(a: NavAccess): NavLink[] {
  return [
    { href: '/enseignant', label: 'Mon centre' },
    ...(corrections(a) ? [{ href: '/admin/evaluations', label: 'Corrections' }] : []),
    ...(enrollments(a) ? [{ href: '/admin/inscriptions', label: 'Inscriptions' }] : []),
    ...(a.isSuperAdmin ? [{ href: '/admin/organisations', label: 'Centres' }] : has(a, 'org_admin') ? [{ href: '/admin/organisations', label: 'Équipe' }] : []),
  ];
}

/** Navigation view of what `/api/me` returns. */
export function navAccessOf(me: { isSuperAdmin: boolean; memberships: readonly { role: OrgRole }[] }): NavAccess {
  return { isSuperAdmin: me.isSuperAdmin, roles: [...new Set(me.memberships.map((m) => m.role))] };
}
