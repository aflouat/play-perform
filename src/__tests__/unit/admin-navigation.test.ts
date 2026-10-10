import { adminLinks, centreHome, isExaminerOnly, type NavAccess } from '@/modules/organizations';

const access = (isSuperAdmin: boolean, ...roles: NavAccess['roles']): NavAccess => ({ isSuperAdmin, roles });
const labels = (links: { label: string }[]) => links.map((l) => l.label);

describe('adminLinks (the one menu of the centre’s side)', () => {
  it('shows everything to the super admin, home first', () => {
    expect(labels(adminLinks(access(true)))).toEqual(
      ['Mon centre', 'Questions', 'Import CSV', 'Parcours', 'Formations', 'Tarifs', 'Centres', 'Inscriptions', 'Corrections', 'Médailles']);
  });

  it('keeps a centre manager on the centre’s operations: no pricing, questions, routes or import', () => {
    const links = labels(adminLinks(access(false, 'org_admin')));
    expect(links).toEqual(['Mon centre', 'Inscriptions', 'Corrections', 'Médailles', 'Équipe']);
    ['Tarifs', 'Parcours', 'Formations', 'Questions', 'Import CSV', 'Centres'].forEach((l) => expect(links).not.toContain(l));
  });

  it('gives a teacher the students’ screens, an examiner only the corrections', () => {
    expect(labels(adminLinks(access(false, 'teacher')))).toEqual(['Mon centre', 'Inscriptions', 'Médailles']);
    expect(labels(adminLinks(access(false, 'examiner')))).toEqual(['Mes corrections', 'Corrections']);
  });

  it('merges the roles of someone who is teacher in one centre and examiner in another', () => {
    expect(labels(adminLinks(access(false, 'teacher', 'examiner')))).toEqual(['Mon centre', 'Inscriptions', 'Corrections', 'Médailles']);
  });

  it('never lists the same destination twice', () => {
    for (const a of [access(true), access(false, 'org_admin'), access(false, 'teacher', 'examiner', 'org_admin'), access(false, 'examiner')]) {
      const hrefs = adminLinks(a).map((l) => l.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it('starts with the home of the role', () => {
    expect(adminLinks(access(false, 'teacher'))[0].href).toBe('/enseignant');
    expect(adminLinks(access(false, 'examiner'))[0].href).toBe('/examinateur');
  });

  it('shows nothing but the home to someone without a role, and only existing pages', () => {
    expect(labels(adminLinks(access(false)))).toEqual(['Mon centre']);
    adminLinks(access(true)).forEach((l) => expect(l.href).toMatch(/^\/(admin|enseignant|examinateur)/));
  });
});

describe('examiner-only accounts', () => {
  it('land on their correction queue instead of a centre’s student list', () => {
    expect(isExaminerOnly(access(false, 'examiner'))).toBe(true);
    expect(centreHome(access(false, 'examiner'))).toBe('/examinateur');
    expect(centreHome(access(false, 'teacher'))).toBe('/enseignant');
  });
  it('is not the case as soon as the person also teaches, manages, or is super admin', () => {
    expect(isExaminerOnly(access(false, 'examiner', 'teacher'))).toBe(false);
    expect(isExaminerOnly(access(true, 'examiner'))).toBe(false);
    expect(isExaminerOnly(access(false))).toBe(false);
  });
});
