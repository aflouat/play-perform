/** @jest-environment node */
import { issueIfEligible } from '@/modules/certificates/application/issue';
import * as repo from '@/modules/certificates/infra/certificate-repository';
import * as skills from '@/modules/skills/server';
import * as competition from '@/modules/competition/server';
import { verificationStatus } from '@/modules/certificates/domain/certificate';

jest.mock('@/modules/certificates/infra/certificate-repository');
jest.mock('@/modules/competition/server');
jest.mock('@/modules/skills/server', () => ({
  ...jest.requireActual('@/modules/skills/domain/enrollment'),
  getSkillById: jest.requireActual('@/modules/skills/infra/skills-repository').getSkillById,
  listLevels: jest.fn(), listEnrollmentsForProfile: jest.fn(), listEvaluationsForProfile: jest.fn(),
}));

const passed = { id: 'ev1', profileId: 'p1', organizationId: 'org-1', skillId: 'logique', level: 4, prompt: '', answer: '', status: 'passed', examinerComment: null, createdAt: '2026-10-01', correctedAt: '2026-10-09T10:00:00Z' };

beforeEach(() => {
  jest.resetAllMocks();
  process.env.CERTIFICATE_SECRET = 'test-secret';
  jest.mocked(repo.liveCertificate).mockResolvedValue(null);
  jest.mocked(repo.insertCertificate).mockResolvedValue('created');
  jest.mocked(skills.listLevels).mockResolvedValue({ logique: 5 });
  jest.mocked(skills.listEnrollmentsForProfile).mockResolvedValue([{ skillId: 'logique', status: 'approved' }] as never);
  jest.mocked(skills.listEvaluationsForProfile).mockResolvedValue([passed] as never);
  jest.mocked(competition.readIdentity).mockResolvedValue({ firstName: 'Léa', lastName: 'Martin', nickname: 'Lynx', showInRanking: true, centreName: 'Centre Alpha' });
  jest.mocked(competition.organizationOf).mockResolvedValue('org-1');
});

describe('automatic issuance', () => {
  it('issues a signed certificate dated by the examiner’s validation once the learner is eligible', async () => {
    const c = await issueIfEligible('p1', 'logique');
    expect(c).toMatchObject({ reference: expect.stringMatching(/^PP-[0-9A-F]{8}$/), firstName: 'Léa', lastName: 'Martin', skillName: 'Logique et raisonnement', levelLabel: 'Expertise', centreName: 'Centre Alpha', issuedOn: '2026-10-09' });
    expect(verificationStatus(c, c?.signature ?? '', 'test-secret')).toBe('valid');
    expect(repo.insertCertificate).toHaveBeenCalledWith(expect.objectContaining({ signature: c?.signature }), 'org-1');
  });

  it('issues nothing while something is missing, and only once', async () => {
    jest.mocked(skills.listLevels).mockResolvedValue({ logique: 4 });
    expect(await issueIfEligible('p1', 'logique')).toBeNull();
    const existing = { reference: 'PP-1', signature: 'x' } as never;
    jest.mocked(repo.liveCertificate).mockResolvedValue(existing);
    expect(await issueIfEligible('p1', 'logique')).toBe(existing);
    expect(repo.insertCertificate).not.toHaveBeenCalled();
  });

  it('adds a suffix when the short reference is already taken by someone else', async () => {
    jest.mocked(repo.insertCertificate).mockResolvedValueOnce('reference-taken').mockResolvedValueOnce('created');
    const c = await issueIfEligible('p1', 'logique');
    expect(c?.reference).toMatch(/^PP-[0-9A-F]{8}-2$/);
  });
});
