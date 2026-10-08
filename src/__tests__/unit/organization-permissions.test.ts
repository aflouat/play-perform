import {
  DEFAULT_ORGANIZATION_ID, canCreateOrganization, canRecruit, canManageStudents, canDecideEnrollments, canCorrectEvaluations,
  organizationsWhere, studentOrganization, validateMemberInput, validateOrganizationInput, slugify, type AccessContext,
} from '@/modules/organizations';

const A = 'org-a';
const B = 'org-b';
const ctx = (overrides: Partial<AccessContext> = {}): AccessContext => ({ userId: 'u1', email: 'u@x.fr', isSuperAdmin: false, memberships: [], ...overrides });
const member = (organizationId: string, role: 'org_admin' | 'teacher' | 'examiner') => ({ organizationId, role });

describe('permissions', () => {
  it('lets only the super admin create organizations', () => {
    expect(canCreateOrganization(ctx({ isSuperAdmin: true }))).toBe(true);
    expect(canCreateOrganization(ctx({ memberships: [member(A, 'org_admin')] }))).toBe(false);
  });

  it('lets a centre admin (and the super admin) recruit in their own centre only', () => {
    expect(canRecruit(ctx({ memberships: [member(A, 'org_admin')] }), A)).toBe(true);
    expect(canRecruit(ctx({ memberships: [member(A, 'org_admin')] }), B)).toBe(false);
    expect(canRecruit(ctx({ memberships: [member(A, 'teacher')] }), A)).toBe(false);
    expect(canRecruit(ctx({ isSuperAdmin: true }), B)).toBe(true);
  });

  it('lets centre admins and teachers manage the students of their centre', () => {
    expect(canManageStudents(ctx({ memberships: [member(A, 'teacher')] }), A)).toBe(true);
    expect(canManageStudents(ctx({ memberships: [member(A, 'examiner')] }), A)).toBe(false);
    expect(canManageStudents(ctx({ memberships: [member(A, 'teacher')] }), B)).toBe(false);
  });

  it('lets the centre decide on enrollments, not the examiner', () => {
    expect(canDecideEnrollments(ctx({ memberships: [member(A, 'org_admin')] }), A)).toBe(true);
    expect(canDecideEnrollments(ctx({ memberships: [member(A, 'teacher')] }), A)).toBe(true);
    expect(canDecideEnrollments(ctx({ memberships: [member(A, 'examiner')] }), A)).toBe(false);
  });

  it('lets an examiner correct evaluations of every centre they are attached to', () => {
    const examiner = ctx({ memberships: [member(A, 'examiner'), member(B, 'examiner')] });
    expect(canCorrectEvaluations(examiner, A)).toBe(true);
    expect(canCorrectEvaluations(examiner, B)).toBe(true);
    expect(canCorrectEvaluations(examiner, 'org-c')).toBe(false);
    expect(canCorrectEvaluations(ctx({ memberships: [member(A, 'teacher')] }), A)).toBe(false);
  });
});

describe('organizationsWhere', () => {
  it('returns "all" for the super admin and the matching centres otherwise', () => {
    expect(organizationsWhere(ctx({ isSuperAdmin: true }), canCorrectEvaluations)).toBe('all');
    const examiner = ctx({ memberships: [member(A, 'examiner'), member(B, 'teacher'), member(B, 'examiner')] });
    expect(organizationsWhere(examiner, canCorrectEvaluations)).toEqual([A, B]);
    expect(organizationsWhere(ctx(), canCorrectEvaluations)).toEqual([]);
  });
});

describe('studentOrganization', () => {
  it('puts a student in the centre of the teacher, else in the parent company', () => {
    expect(studentOrganization(ctx({ memberships: [member(A, 'examiner'), member(B, 'teacher')] }))).toBe(B);
    expect(studentOrganization(ctx({ memberships: [member(A, 'org_admin')] }))).toBe(A);
    expect(studentOrganization(ctx())).toBe(DEFAULT_ORGANIZATION_ID);
  });
});

describe('inputs', () => {
  it('slugifies names', () => {
    expect(slugify(' Centre Éveil & Co ! ')).toBe('centre-eveil-co');
  });
  it('validates an organization', () => {
    expect(validateOrganizationInput({ name: 'Centre Alpha' })).toEqual({ ok: true, value: { name: 'Centre Alpha', slug: 'centre-alpha' } });
    expect(validateOrganizationInput({ name: 'A' }).ok).toBe(false);
    expect(validateOrganizationInput({ name: 'Centre', slug: 'Pas Valide!' }).ok).toBe(false);
    expect(validateOrganizationInput(null).ok).toBe(false);
  });
  it('validates a member (email + role)', () => {
    expect(validateMemberInput({ email: ' Ana@Ecole.FR ', role: 'examiner' })).toEqual({ ok: true, value: { email: 'ana@ecole.fr', role: 'examiner' } });
    expect(validateMemberInput({ email: 'nope', role: 'examiner' }).ok).toBe(false);
    expect(validateMemberInput({ email: 'a@b.fr', role: 'super_admin' }).ok).toBe(false);
  });
});
