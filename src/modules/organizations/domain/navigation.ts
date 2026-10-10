import type { OrgRole } from './access';

export interface NavLink { href: string; label: string }
export interface NavAccess { isSuperAdmin: boolean; roles: readonly OrgRole[] }

const has = (a: NavAccess, role: OrgRole) => a.roles.includes(role);
const students = (a: NavAccess) => has(a, 'teacher') || has(a, 'org_admin');
const corrections = (a: NavAccess) => a.isSuperAdmin || has(a, 'examiner') || has(a, 'org_admin');
const enrollments = (a: NavAccess) => a.isSuperAdmin || students(a);

/** Someone who only corrects: their home is the correction queue, not a centre's student list. */
export const isExaminerOnly = (a: NavAccess): boolean => !a.isSuperAdmin && a.roles.length > 0 && a.roles.every((r) => r === 'examiner');

/** Where the logo of a signed-in centre account leads. */
export const centreHome = (a: NavAccess): string => (isExaminerOnly(a) ? '/examinateur' : '/enseignant');

/**
 * THE menu of the centre's side (one menu, shown under the header on every back-office screen):
 * each role sees only the screens it may use. The super admin (parent company) also runs what all centres share.
 */
export function adminLinks(a: NavAccess): NavLink[] {
  const home: NavLink[] = isExaminerOnly(a)
    ? [{ href: '/examinateur', label: 'Mes corrections' }]
    : [{ href: '/enseignant', label: 'Mon centre' }];
  return [
    ...home,
    ...(a.isSuperAdmin ? [
      { href: '/admin/questions', label: 'Questions' }, { href: '/admin/import', label: 'Import CSV' },
      { href: '/admin/parcours', label: 'Parcours' }, { href: '/admin/formations', label: 'Formations' }, { href: '/admin/pricing', label: 'Tarifs' }, { href: '/admin/organisations', label: 'Centres' }, { href: '/admin/audit-chats', label: 'Audit des chats' },
    ] : []),
    ...(enrollments(a) ? [{ href: '/admin/inscriptions', label: 'Inscriptions' }] : []),
    ...(corrections(a) ? [{ href: '/admin/evaluations', label: 'Corrections' }] : []),
    ...(has(a, 'examiner') ? [{ href: '/examinateur/agenda', label: 'Agenda des oraux' }] : []),
    ...(students(a) || a.isSuperAdmin ? [{ href: '/enseignant/classement', label: 'Médailles' }] : []),
    ...(!a.isSuperAdmin && has(a, 'org_admin') ? [{ href: '/admin/organisations', label: 'Équipe' }] : []),
  ];
}

/** Navigation view of what `/api/me` returns. */
export function navAccessOf(me: { isSuperAdmin: boolean; memberships: readonly { role: OrgRole }[] }): NavAccess {
  return { isSuperAdmin: me.isSuperAdmin, roles: [...new Set(me.memberships.map((m) => m.role))] };
}
