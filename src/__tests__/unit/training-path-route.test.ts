/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/training-path/route';
import * as actorAuth from '@/lib/actor-auth';
import * as server from '@/modules/dashboards/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/modules/dashboards/server');

const actor = jest.mocked(actorAuth);
const repo = jest.mocked(server);
const get = (profileId: string) => new NextRequest(`http://x/api/training-path?profileId=${profileId}`, { headers: { authorization: 'Bearer t' } });
const put = (body: unknown) => new NextRequest('http://x/api/training-path', { method: 'PUT', body: JSON.stringify(body), headers: { authorization: 'Bearer t' } });

beforeEach(() => {
  jest.resetAllMocks();
  actor.canAccessProfile.mockResolvedValue(true);
  repo.readTrainingPath.mockResolvedValue(null);
  repo.writeTrainingPath.mockResolvedValue(undefined);
  repo.choosablePathIds.mockResolvedValue(['college', 'technicien-laboratoire', 'mathematiques']);
});

describe('/api/training-path', () => {
  it('refuses without a session, and for someone else’s profile', async () => {
    actor.getActorFromRequest.mockResolvedValue(null);
    expect((await GET(get('p1'))).status).toBe(401);
    actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p2' });
    actor.canAccessProfile.mockResolvedValue(false);
    expect((await GET(get('p1'))).status).toBe(404);
  });

  it('returns the learner’s path', async () => {
    actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
    repo.readTrainingPath.mockResolvedValue('mathematiques');
    expect(await (await GET(get('p1'))).json()).toEqual({ pathId: 'mathematiques' });
  });

  it('lets the learner choose a first path, not change it', async () => {
    actor.getActorFromRequest.mockResolvedValue({ kind: 'learner', profileId: 'p1' });
    expect((await PUT(put({ profileId: 'p1', pathId: 'mathematiques' }))).status).toBe(200);
    expect(repo.writeTrainingPath).toHaveBeenCalledWith('p1', 'mathematiques');
    repo.readTrainingPath.mockResolvedValue('mathematiques');
    expect((await PUT(put({ profileId: 'p1', pathId: 'technicien-laboratoire' }))).status).toBe(403);
  });

  it('lets the teacher change it', async () => {
    actor.getActorFromRequest.mockResolvedValue({ kind: 'teacher', userId: 'u1' });
    repo.readTrainingPath.mockResolvedValue('mathematiques');
    expect((await PUT(put({ profileId: 'p1', pathId: 'technicien-laboratoire' }))).status).toBe(200);
    expect(repo.writeTrainingPath).toHaveBeenCalledWith('p1', 'technicien-laboratoire');
  });
});
