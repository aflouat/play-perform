import { adminLinks, centreHeaderLinks, type NavAccess } from '@/modules/organizations';

const access = (isSuperAdmin: boolean, ...roles: NavAccess['roles']): NavAccess => ({ isSuperAdmin, roles });
const labels = (links: { label: string }[]) => links.map((l) => l.label);

describe('adminLinks (back-office menu)', () => {
  it('shows everything to the super admin', () => {
    expect(labels(adminLinks(access(true)))).toEqual(
      ['Questions', 'Import CSV', 'Parcours', 'Tarifs', 'Centres', 'Inscriptions', 'Corrections']);
  });

  it('keeps a centre manager on the centre’s operations: no pricing, questions, routes or import', () => {
    const links = labels(adminLinks(access(false, 'org_admin')));
    expect(links).toEqual(['Élèves', 'Inscriptions', 'Corrections', 'Équipe']);
    ['Tarifs', 'Parcours', 'Questions', 'Import CSV', 'Centres'].forEach((l) => expect(links).not.toContain(l));
  });

  it('gives a teacher the students and enrollments, an examiner only the corrections', () => {
    expect(labels(adminLinks(access(false, 'teacher')))).toEqual(['Élèves', 'Inscriptions']);
    expect(labels(adminLinks(access(false, 'examiner')))).toEqual(['Corrections']);
  });

  it('merges the roles of someone who is teacher in one centre and examiner in another', () => {
    expect(labels(adminLinks(access(false, 'teacher', 'examiner')))).toEqual(['Élèves', 'Inscriptions', 'Corrections']);
  });

  it('shows nothing to someone without a role', () => {
    expect(adminLinks(access(false))).toEqual([]);
  });

  it('points to existing admin pages', () => {
    adminLinks(access(true)).forEach((l) => expect(l.href).toMatch(/^\/(admin|enseignant)/));
  });
});

describe('centreHeaderLinks (site header of a signed-in centre)', () => {
  it('always starts with "Mon centre"', () => {
    expect(labels(centreHeaderLinks(access(false)))).toEqual(['Mon centre']);
  });
  it('adds only what the roles allow, with a short label', () => {
    expect(labels(centreHeaderLinks(access(false, 'org_admin')))).toEqual(['Mon centre', 'Corrections', 'Inscriptions', 'Équipe']);
    expect(labels(centreHeaderLinks(access(false, 'examiner')))).toEqual(['Mon centre', 'Corrections']);
    expect(labels(centreHeaderLinks(access(true)))).toEqual(['Mon centre', 'Corrections', 'Inscriptions', 'Centres']);
  });
});
