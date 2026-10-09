/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/competition/route';
import { POST } from '@/app/api/competition/challenge/route';
import { PUT } from '@/app/api/competition/profile/route';
import * as actorAuth from '@/lib/actor-auth';
import * as server from '@/modules/competition/server';
import { challengeFor, isoWeek } from '@/modules/competition';

jest.mock('@/lib/actor-auth');
jest.mock('@/modules/competition/server');

const actor = jest.mocked(actorAuth);
const repo = jest.mocked(server);
const learner = { kind: 'learner', profileId: 'p1' } as const;
const teacher = { kind: 'teacher', userId: 'u1' } as const;

const request = (url: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, { method, headers: { authorization: 'Bearer t', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });

beforeEach(() => {
  jest.resetAllMocks();
  actor.getActorFromRequest.mockResolvedValue(learner);
  actor.canAccessProfile.mockResolvedValue(true);
  repo.organizationOf.mockResolvedValue('org');
});

describe('GET /api/competition', () => {
  it('returns the ranking of the learner’s centre without any profile id', async () => {
    repo.loadCompetitionData.mockResolvedValue({
      students: [{ id: 'p1', nickname: 'RenardBleu1' }, { id: 'p2', nickname: 'LynxMalin2' }],
      scores: [{ profile_id: 'p2', xp: 50, streak: 1 }], levelSums: {}, results: [], revocations: [],
    });
    const res = await GET(request('/api/competition?profileId=p1&metric=xp', 'GET'));
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('LynxMalin2');
    expect(text).not.toMatch(/p1|p2|profile_id/);
  });

  it('refuses another learner’s profile and unknown metrics', async () => {
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await GET(request('/api/competition?profileId=p9', 'GET'))).status).toBe(404);
    expect((await GET(request('/api/competition?profileId=p1&metric=hack', 'GET'))).status).toBe(400);
  });
});

describe('POST /api/competition/challenge', () => {
  const { questions } = challengeFor(isoWeek(new Date()));
  const allRight = questions.map((q) => ({ questionId: q.id, optionId: q.correctOptionId }));

  it('recomputes the score on the server, ignoring any claimed score', async () => {
    repo.saveChallengeResult.mockResolvedValue(true);
    const res = await POST(request('/api/competition/challenge', 'POST', { profileId: 'p1', answers: [], durationMs: 5000, correct: 5 }));
    expect(await res.json()).toEqual({ correct: 0, total: 5 });
    expect(repo.saveChallengeResult).toHaveBeenCalledWith(expect.objectContaining({ correct: 0, total: 5, profileId: 'p1' }));
  });

  it('counts real answers', async () => {
    repo.saveChallengeResult.mockResolvedValue(true);
    const res = await POST(request('/api/competition/challenge', 'POST', { profileId: 'p1', answers: allRight, durationMs: 5000 }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ correct: 5, total: 5 });
  });

  it('allows one attempt per week', async () => {
    repo.saveChallengeResult.mockResolvedValue(false);
    expect((await POST(request('/api/competition/challenge', 'POST', { profileId: 'p1', answers: allRight, durationMs: 1 }))).status).toBe(409);
  });

  it('rejects malformed bodies', async () => {
    expect((await POST(request('/api/competition/challenge', 'POST', { profileId: 'p1', answers: 'x', durationMs: 1 }))).status).toBe(400);
    expect((await POST(request('/api/competition/challenge', 'POST', { profileId: 'p1', answers: [], durationMs: -5 }))).status).toBe(400);
  });
});

describe('PUT /api/competition/profile', () => {
  it('is for teachers only (a learner cannot rename themselves or others)', async () => {
    expect((await PUT(request('/api/competition/profile', 'PUT', { profileId: 'p1', nickname: 'Champion1' }))).status).toBe(401);
    expect(repo.updateRankingProfile).not.toHaveBeenCalled();
  });

  it('validates the pseudonym and reports a clash', async () => {
    actor.getActorFromRequest.mockResolvedValue(teacher);
    expect((await PUT(request('/api/competition/profile', 'PUT', { profileId: 'p1', nickname: 'Jean Dupont' }))).status).toBe(400);
    repo.updateRankingProfile.mockResolvedValue('taken');
    expect((await PUT(request('/api/competition/profile', 'PUT', { profileId: 'p1', nickname: 'Champion1' }))).status).toBe(409);
    repo.updateRankingProfile.mockResolvedValue('ok');
    expect((await PUT(request('/api/competition/profile', 'PUT', { profileId: 'p1', showInRanking: false }))).status).toBe(200);
    expect(repo.updateRankingProfile).toHaveBeenLastCalledWith('p1', { showInRanking: false });
  });
});
