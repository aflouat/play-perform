/** @jest-environment node */
import { NextRequest } from 'next/server';
import { GET as readChat } from '@/app/api/chat/route';
import { POST as send } from '@/app/api/chat/messages/route';
import { POST as report } from '@/app/api/chat/messages/[id]/report/route';
import { GET as auditList } from '@/app/api/audit/chats/route';
import { GET as auditThread } from '@/app/api/audit/chats/[id]/route';
import * as actorAuth from '@/lib/actor-auth';
import * as adminAuth from '@/lib/admin-auth';
import * as server from '@/modules/collab/server';

jest.mock('@/lib/actor-auth');
jest.mock('@/lib/admin-auth');
jest.mock('@/modules/collab/server');

const repo = jest.mocked(server);
const future = new Date(Date.now() + 3 * 86_400_000).toISOString();
const thread = (closesAt = future) => ({ id: 't1', organizationId: 'org-1', contextKey: '2026-W41', memberIds: ['p1', 'p2'], opensAt: '2026-10-05T00:00:00Z', closesAt });
const nicknames = new Map([['p1', 'Lynx'], ['p2', 'Orque']]);
const req = (url: string, method = 'GET', body?: unknown) => new NextRequest(`http://x${url}`, { method, body: body ? JSON.stringify(body) : undefined });
let sender = 0;

beforeEach(() => {
  jest.resetAllMocks();
  sender += 1;
  jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'learner', profileId: `p1` });
  repo.currentPairThread.mockResolvedValue({ thread: thread(), nicknames });
});

describe('pair chat (learners of the pair only)', () => {
  it('shows the pair’s messages under pseudonyms, mine marked', async () => {
    repo.listMessages.mockResolvedValue([{ id: 'm1', threadId: 't1', authorId: 'p2', body: 'Salut !', createdAt: '2026-10-06T10:00:00Z', reportedAt: null }]);
    const body = await (await readChat(req('/api/chat'))).json();
    expect(body.thread).toMatchObject({ id: 't1', state: 'open', members: [{ nickname: 'Lynx', me: true }, { nickname: 'Orque', me: false }] });
    expect(body.messages).toEqual([{ id: 'm1', mine: false, author: 'Orque', body: 'Salut !', createdAt: '2026-10-06T10:00:00Z', reported: false }]);
  });

  it('is closed to teachers and to learners without a session', async () => {
    jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'teacher', userId: 'u1' });
    expect((await readChat(req('/api/chat'))).status).toBe(403);
    jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue(null);
    expect((await send(req('/api/chat/messages', 'POST', { threadId: 't1', body: 'x' }))).status).toBe(403);
  });

  it('sends a message to the current thread only, never once archived', async () => {
    jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'learner', profileId: `s${sender}` });
    repo.insertMessage.mockResolvedValue({ id: 'm2', threadId: 't1', authorId: 'p1', body: 'On révise jeudi ?', createdAt: '2026-10-06T11:00:00Z', reportedAt: null });
    expect((await send(req('/api/chat/messages', 'POST', { threadId: 't1', body: '  On révise jeudi ?  ' }))).status).toBe(201);
    expect(repo.insertMessage).toHaveBeenCalledWith('t1', `s${sender}`, 'On révise jeudi ?');
    expect((await send(req('/api/chat/messages', 'POST', { threadId: 'other', body: 'x' }))).status).toBe(403);
    repo.currentPairThread.mockResolvedValue({ thread: thread('2026-10-01T00:00:00Z'), nicknames });
    expect((await send(req('/api/chat/messages', 'POST', { threadId: 't1', body: 'x' }))).status).toBe(409);
  });

  it('limits the pace of messages', async () => {
    jest.mocked(actorAuth.getActorFromRequest).mockResolvedValue({ kind: 'learner', profileId: 'spammer' });
    repo.insertMessage.mockResolvedValue({ id: 'm', threadId: 't1', authorId: 'spammer', body: 'x', createdAt: '', reportedAt: null });
    for (let i = 0; i < 20; i++) await send(req('/api/chat/messages', 'POST', { threadId: 't1', body: 'x' }));
    expect((await send(req('/api/chat/messages', 'POST', { threadId: 't1', body: 'x' }))).status).toBe(429);
  });

  it('lets a member report the partner’s message, not their own nor another pair’s', async () => {
    const params = { params: Promise.resolve({ id: 'm1' }) };
    repo.getThread.mockResolvedValue(thread());
    repo.getMessage.mockResolvedValue({ id: 'm1', threadId: 't1', authorId: 'p2', body: '…', createdAt: '', reportedAt: null });
    expect((await report(req('/x', 'POST'), params)).status).toBe(200);
    expect(repo.reportMessage).toHaveBeenCalledWith('m1', 'p1');
    repo.getMessage.mockResolvedValue({ id: 'm1', threadId: 't1', authorId: 'p1', body: '…', createdAt: '', reportedAt: null });
    expect((await report(req('/x', 'POST'), params)).status).toBe(404);
    repo.getThread.mockResolvedValue({ ...thread(), memberIds: ['p3', 'p4'] });
    expect((await report(req('/x', 'POST'), params)).status).toBe(404);
  });
});

describe('audit by Play Perform', () => {
  it('gives the full transcripts with real names to the parent company only', async () => {
    jest.mocked(adminAuth.isAdminAuthorized).mockResolvedValue(false);
    expect((await auditList(req('/api/audit/chats'))).status).toBe(403);
    jest.mocked(adminAuth.isAdminAuthorized).mockResolvedValue(true);
    repo.getThread.mockResolvedValue(thread('2026-10-01T00:00:00Z'));
    repo.listMessages.mockResolvedValue([{ id: 'm1', threadId: 't1', authorId: 'p2', body: 'Salut', createdAt: '2026-10-06', reportedAt: '2026-10-06' }]);
    repo.learnerNames.mockResolvedValue(new Map([['p2', { nickname: 'Orque', name: 'Tom Durand' }]]));
    const body = await (await auditThread(req('/api/audit/chats/t1'), { params: Promise.resolve({ id: 't1' }) })).json();
    expect(body.messages[0]).toMatchObject({ author: { nickname: 'Orque', name: 'Tom Durand' }, body: 'Salut', reportedAt: '2026-10-06' });
  });
});
