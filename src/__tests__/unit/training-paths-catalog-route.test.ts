/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/training-paths/route';
import { PUT } from '@/app/api/training-paths/[id]/route';
import * as adminAuth from '@/lib/admin-auth';
import * as server from '@/modules/dashboards/server';
import { getTrainingPaths } from '@/modules/dashboards/infra/training-paths-seed';

jest.mock('@/lib/admin-auth');
jest.mock('@/modules/dashboards/server');

const admin = jest.mocked(adminAuth);
const repo = jest.mocked(server);
const pharma = () => ({ ...JSON.parse(JSON.stringify(getTrainingPaths()[1])), id: 'technicien-pharma', name: 'Technicien Pharma', active: true });
const req = (method: string, body?: unknown) => new NextRequest('http://x/api/training-paths', { method, body: body ? JSON.stringify(body) : undefined });
const params = (id: string) => ({ params: Promise.resolve({ id }) });

beforeEach(() => {
  jest.resetAllMocks();
  admin.isAdminAuthorized.mockResolvedValue(true);
});

describe('/api/training-paths', () => {
  it('lists the catalogue publicly, and falls back on the built-in paths when the table is missing', async () => {
    repo.listTrainingPaths.mockResolvedValue([pharma()]);
    expect((await (await GET()).json()).paths.map((p: { id: string }) => p.id)).toEqual(['technicien-pharma']);
    repo.listTrainingPaths.mockRejectedValue(new Error('relation "training_paths" does not exist'));
    expect((await (await GET()).json()).paths).toHaveLength(getTrainingPaths().length);
  });

  it('creates a path for the parent company only', async () => {
    admin.isAdminAuthorized.mockResolvedValue(false);
    expect((await POST(req('POST', pharma()))).status).toBe(403);
    admin.isAdminAuthorized.mockResolvedValue(true);
    repo.insertTrainingPath.mockResolvedValue('created');
    expect((await POST(req('POST', pharma()))).status).toBe(201);
    expect(repo.insertTrainingPath).toHaveBeenCalledWith(expect.objectContaining({ id: 'technicien-pharma', name: 'Technicien Pharma' }));
  });

  it('refuses an invalid path and an identifier already used', async () => {
    expect((await POST(req('POST', { ...pharma(), name: '' }))).status).toBe(400);
    repo.insertTrainingPath.mockResolvedValue('exists');
    expect((await POST(req('POST', pharma()))).status).toBe(409);
  });

  it('updates a path (identifier from the URL)', async () => {
    repo.updateTrainingPath.mockResolvedValue('updated');
    expect((await PUT(req('PUT', { ...pharma(), id: 'ignored' }), params('technicien-pharma'))).status).toBe(200);
    expect(repo.updateTrainingPath).toHaveBeenCalledWith(expect.objectContaining({ id: 'technicien-pharma' }));
    repo.updateTrainingPath.mockResolvedValue('missing');
    expect((await PUT(req('PUT', pharma()), params('nope-path'))).status).toBe(404);
    admin.isAdminAuthorized.mockResolvedValue(false);
    expect((await PUT(req('PUT', pharma()), params('technicien-pharma'))).status).toBe(403);
  });
});
