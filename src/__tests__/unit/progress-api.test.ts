/** @jest-environment node */
import { NextRequest } from 'next/server';
import { validateProgressInput } from '@/lib/progress-validate';
import { PUT } from '@/app/api/progress/route';
import * as actorAuth from '@/lib/actor-auth';
import * as client from '@/lib/db/client';

jest.mock('@/lib/actor-auth');
jest.mock('@/lib/db/client');

describe('validateProgressInput', () => {
  it('accepts a score and a badge', () => {
    expect(validateProgressInput({ kind: 'score', profileId: 'p1', xp: 120, level: 2, streak: 3 }).ok).toBe(true);
    expect(validateProgressInput({ kind: 'badge', profileId: 'p1', badgeId: 'first-quiz' }).ok).toBe(true);
  });
  it.each([
    [{ kind: 'score', profileId: 'p1', xp: -1, level: 1, streak: 0 }],
    [{ kind: 'score', profileId: 'p1', xp: 1.5, level: 1, streak: 0 }],
    [{ kind: 'score', profileId: '', xp: 1, level: 1, streak: 0 }],
    [{ kind: 'badge', profileId: 'p1', badgeId: 'Bad Id!' }],
    [{ kind: 'other', profileId: 'p1' }],
    [null],
  ])('rejects %j', (input) => {
    expect(validateProgressInput(input).ok).toBe(false);
  });
});

describe('PUT /api/progress', () => {
  const actor = jest.mocked(actorAuth);
  const upsert = jest.fn().mockResolvedValue({ error: null });
  const body = { kind: 'score', profileId: 'p1', xp: 10, level: 1, streak: 1 };
  const call = () => PUT(new NextRequest('http://localhost/api/progress', {
    method: 'PUT', headers: { authorization: 'Bearer t', 'content-type': 'application/json' }, body: JSON.stringify(body),
  }));

  beforeEach(() => {
    jest.resetAllMocks();
    upsert.mockResolvedValue({ error: null });
    jest.mocked(client.getServerClient).mockReturnValue({ from: () => ({ upsert }) } as never);
  });

  it('saves the score of a profile the caller may access', async () => {
    actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
    actor.canAccessProfile.mockResolvedValue(true);
    expect((await call()).status).toBe(200);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ profile_id: 'p1', xp: 10 }), expect.anything());
  });

  it('refuses another learner’s profile and anonymous callers', async () => {
    actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'other' });
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await call()).status).toBe(404);
    actor.getActorFromRequest.mockResolvedValue(null);
    expect((await call()).status).toBe(401);
    expect(upsert).not.toHaveBeenCalled();
  });
});
