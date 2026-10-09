/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET as getPair, POST as claim } from '@/app/api/competition/pair/route';
import { POST as cheer } from '@/app/api/competition/cheer/route';
import { GET as feed } from '@/app/api/competition/feed/route';
import { DELETE as hide } from '@/app/api/competition/events/[id]/route';
import { POST as postStats, GET as getStats } from '@/app/api/stats/answers/route';
import * as actorAuth from '@/lib/actor-auth';
import * as competition from '@/modules/competition/server';
import * as community from '@/modules/community/server';
import { BONUS_XP } from '@/modules/competition';

jest.mock('@/lib/actor-auth');
jest.mock('@/modules/competition/server');
jest.mock('@/modules/community/server', () => ({ ...jest.requireActual('@/modules/community/server'), recordAnswers: jest.fn(), loadDistributions: jest.fn() }));

const actor = jest.mocked(actorAuth);
const repo = jest.mocked(competition);
const stats = jest.mocked(community);
const call = (url: string, method: string, body?: unknown) =>
  new NextRequest(`http://localhost${url}`, { method, headers: { authorization: 'Bearer t', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
const students = ['p1', 'p2'].map((id) => ({ id, nickname: `Pseudo_${id}` }));
const win = [{ profile_id: 'p1', week: '', correct: 5, total: 5 }, { profile_id: 'p2', week: '', correct: 4, total: 5 }];

beforeEach(() => {
  jest.resetAllMocks();
  actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
  actor.canAccessProfile.mockResolvedValue(true);
  repo.ensureNickname.mockResolvedValue('Pseudo_p1');
});

describe('pair of the week', () => {
  const data = (results = win) => {
    const { isoWeek } = jest.requireActual('@/modules/competition');
    return { organizationId: 'centre-a', students, results: results.map((r) => ({ ...r, week: isoWeek(new Date()) })), claimed: false };
  };

  it('shows my pair with pseudonyms only', async () => {
    repo.loadPairData.mockResolvedValue(data([]));
    const text = await (await getPair(call('/api/competition/pair?profileId=p1', 'GET'))).text();
    expect(text).toContain('Pseudo_p2');
    expect(text).not.toMatch(/"p2"|profile_id/);
  });

  it('pays the bonus once, only when both got the mention', async () => {
    repo.loadPairData.mockResolvedValue(data());
    repo.saveBonusClaim.mockResolvedValue(true);
    const res = await claim(call('/api/competition/pair', 'POST', { profileId: 'p1' }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ xp: BONUS_XP });
    repo.saveBonusClaim.mockResolvedValue(false);
    expect((await claim(call('/api/competition/pair', 'POST', { profileId: 'p1' }))).status).toBe(409);
  });

  it('refuses the bonus when the partner fell short', async () => {
    repo.loadPairData.mockResolvedValue(data([win[0], { ...win[1], correct: 3 }]));
    expect((await claim(call('/api/competition/pair', 'POST', { profileId: 'p1' }))).status).toBe(409);
    expect(repo.saveBonusClaim).not.toHaveBeenCalled();
  });

  it('refuses someone else’s profile', async () => {
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await claim(call('/api/competition/pair', 'POST', { profileId: 'p9' }))).status).toBe(404);
  });
});

describe('feed and cheers', () => {
  it('lists the centre’s successes with skill names and no learner ids', async () => {
    repo.loadFeed.mockResolvedValue([{ id: 'e1', profileId: 'p2', nickname: 'Pseudo_p2', skillId: 'logique', level: 5, createdAt: '2026-10-08T10:00:00Z', cheers: 2, cheeredByMe: false }]);
    const text = await (await feed(call('/api/competition/feed?profileId=p1', 'GET'))).text();
    expect(text).toContain('Logique et raisonnement');
    expect(text).not.toContain('"p2"');
    expect(JSON.parse(text).events[0]).toMatchObject({ isMine: false, cheers: 2 });
  });

  it('lets a learner cheer a friend of the same centre once, never themselves', async () => {
    repo.organizationOf.mockResolvedValue('centre-a');
    repo.eventInfo.mockResolvedValue({ profileId: 'p2', organizationId: 'centre-a' });
    repo.addCheer.mockResolvedValue(true);
    expect((await cheer(call('/api/competition/cheer', 'POST', { profileId: 'p1', eventId: 'e1' }))).status).toBe(201);
    repo.addCheer.mockResolvedValue(false);
    expect((await cheer(call('/api/competition/cheer', 'POST', { profileId: 'p1', eventId: 'e1' }))).status).toBe(409);
    repo.eventInfo.mockResolvedValue({ profileId: 'p1', organizationId: 'centre-a' });
    expect((await cheer(call('/api/competition/cheer', 'POST', { profileId: 'p1', eventId: 'e2' }))).status).toBe(400);
  });

  it('does not let a learner cheer an event of another centre', async () => {
    repo.organizationOf.mockResolvedValue('centre-a');
    repo.eventInfo.mockResolvedValue({ profileId: 'p7', organizationId: 'centre-b' });
    expect((await cheer(call('/api/competition/cheer', 'POST', { profileId: 'p1', eventId: 'e1' }))).status).toBe(404);
    expect(repo.addCheer).not.toHaveBeenCalled();
  });

  it('lets only a teacher remove an item from the feed', async () => {
    repo.eventInfo.mockResolvedValue({ profileId: 'p2', organizationId: 'centre-a' });
    const params = { params: Promise.resolve({ id: 'e1' }) };
    expect((await hide(call('/api/competition/events/e1', 'DELETE'), params)).status).toBe(401);
    actor.getActorFromRequest.mockResolvedValue({ kind: 'teacher', userId: 'u1' });
    expect((await hide(call('/api/competition/events/e1', 'DELETE'), params)).status).toBe(200);
    expect(repo.hideEvent).toHaveBeenCalledWith('e1');
  });
});

describe('anonymous answer statistics', () => {
  it('records a finished quiz without any learner identity', async () => {
    const res = await postStats(call('/api/stats/answers', 'POST', { answers: [{ questionId: 'maths-1', optionId: 'B' }], profileId: 'p1' }));
    expect(res.status).toBe(201);
    expect(stats.recordAnswers).toHaveBeenCalledWith([{ questionId: 'maths-1', optionId: 'B' }]);
  });
  it('rejects malformed answers', async () => {
    expect((await postStats(call('/api/stats/answers', 'POST', { answers: [{ questionId: 'x y', optionId: 'Z' }] }))).status).toBe(400);
    expect((await postStats(call('/api/stats/answers', 'POST', { answers: 'nope' }))).status).toBe(400);
  });
  it('returns counts per option', async () => {
    stats.loadDistributions.mockResolvedValue({ q1: { A: 3, B: 9 } });
    expect(await (await getStats(call('/api/stats/answers?ids=q1', 'GET'))).json()).toEqual({ distributions: { q1: { A: 3, B: 9 } } });
  });
});
