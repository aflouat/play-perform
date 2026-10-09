/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/profile/route';
import * as actorAuth from '@/lib/actor-auth';
import * as server from '@/modules/competition/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/modules/competition/server');

const actor = jest.mocked(actorAuth);
const repo = jest.mocked(server);
const stored = { firstName: 'Léa', lastName: null, nickname: null, showInRanking: true, centreName: 'Centre Alpha SAS' };
const call = (method: string, body?: unknown, url = '/api/profile?profileId=p1') =>
  new NextRequest(`http://localhost${url}`, { method, headers: { authorization: 'Bearer t', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

beforeEach(() => {
  jest.resetAllMocks();
  actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  actor.canAccessProfile.mockResolvedValue(true);
  repo.readIdentity.mockResolvedValue(stored);
});

describe('GET /api/profile', () => {
  it('returns the identity of my profile, with the centre for the diploma', async () => {
    const res = await GET(call('GET'));
    expect(await res.json()).toEqual(stored);
  });
  it('refuses someone else’s profile and anonymous callers', async () => {
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await GET(call('GET'))).status).toBe(404);
    actor.getActorFromRequest.mockResolvedValue(null);
    expect((await GET(call('GET'))).status).toBe(401);
  });
});

describe('PUT /api/profile', () => {
  it('lets the learner set the pseudonym and the names, saving only what changed', async () => {
    repo.writeIdentity.mockResolvedValue('ok');
    const res = await PUT(call('PUT', { profileId: 'p1', lastName: 'Martin', nickname: 'RenardBleu42' }));
    expect(res.status).toBe(200);
    expect(repo.writeIdentity).toHaveBeenCalledWith('p1', { lastName: 'Martin', nickname: 'RenardBleu42' });
  });

  it('refuses a pseudonym that reveals the stored first name', async () => {
    const res = await PUT(call('PUT', { profileId: 'p1', nickname: 'lea2012' }));
    expect(res.status).toBe(400);
    expect(repo.writeIdentity).not.toHaveBeenCalled();
  });

  it('reports a pseudonym already used in the centre', async () => {
    repo.writeIdentity.mockResolvedValue('taken');
    expect((await PUT(call('PUT', { profileId: 'p1', nickname: 'RenardBleu42' }))).status).toBe(409);
  });

  it('refuses another learner’s profile', async () => {
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await PUT(call('PUT', { profileId: 'p9', nickname: 'RenardBleu42' }))).status).toBe(404);
    expect(repo.writeIdentity).not.toHaveBeenCalled();
  });
});
