/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/diploma/route';
import * as actorAuth from '@/lib/actor-auth';
import * as skillsServer from '@/modules/skills/server';
import * as competitionServer from '@/modules/competition/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/modules/competition/server');
jest.mock('@/modules/skills/server', () => ({
  ...jest.requireActual('@/modules/skills/server'),
  listLevels: jest.fn(), listEnrollmentsForProfile: jest.fn(), listEvaluationsForProfile: jest.fn(),
}));

const actor = jest.mocked(actorAuth);
const skills = jest.mocked(skillsServer);
const competition = jest.mocked(competitionServer);
const call = (url = '/api/diploma?profileId=p1&skillId=logique') =>
  new NextRequest(`http://localhost${url}`, { headers: { authorization: 'Bearer t' } });
const passed = { id: 'e', profileId: 'p1', organizationId: 'o', skillId: 'logique', level: 4, prompt: '', answer: '', status: 'passed', examinerComment: null, createdAt: '2026-10-01T10:00:00Z', correctedAt: '2026-10-05T10:00:00Z' } as never;
const enrolled = { id: 'r', profileId: 'p1', organizationId: 'o', skillId: 'logique', motivation: '', status: 'approved', centerComment: null, createdAt: '2026-10-01T10:00:00Z', decidedAt: '2026-10-01T10:00:00Z' } as never;
const identity = { firstName: 'Léa', lastName: 'Martin', nickname: 'Lynx_9', showInRanking: true, centreName: 'Centre Alpha SAS' };

beforeEach(() => {
  jest.resetAllMocks();
  actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  actor.canAccessProfile.mockResolvedValue(true);
  skills.listLevels.mockResolvedValue({ logique: 5 });
  skills.listEnrollmentsForProfile.mockResolvedValue([enrolled]);
  skills.listEvaluationsForProfile.mockResolvedValue([passed]);
  competition.readIdentity.mockResolvedValue(identity);
});

describe('GET /api/diploma', () => {
  it('returns the content of the diploma when the whole training is validated', async () => {
    const body = await (await GET(call())).json();
    expect(body.eligible).toBe(true);
    expect(body.diploma).toMatchObject({ firstName: 'Léa', lastName: 'Martin', skillName: 'Logique et raisonnement', centreName: 'Centre Alpha SAS', issuedOn: '2026-10-05' });
    expect(body.diploma.reference).toMatch(/^PP-[0-9A-F]{8}$/);
  });

  it('says what is missing and prints nothing otherwise', async () => {
    skills.listEvaluationsForProfile.mockResolvedValue([]);
    skills.listEnrollmentsForProfile.mockResolvedValue([]);
    const body = await (await GET(call())).json();
    expect(body).toEqual({ eligible: false, missing: ['enrollment', 'evaluation'], diploma: null });
  });

  it('needs the names, which only the real profile can give', async () => {
    competition.readIdentity.mockResolvedValue({ ...identity, lastName: null });
    expect((await (await GET(call())).json()).missing).toEqual(['names']);
  });

  it('refuses another learner’s profile, unknown skills and anonymous callers', async () => {
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await GET(call())).status).toBe(404);
    expect((await GET(call('/api/diploma?profileId=p1&skillId=nope'))).status).toBe(404);
    actor.getActorFromRequest.mockResolvedValue(null);
    expect((await GET(call())).status).toBe(401);
  });
});
